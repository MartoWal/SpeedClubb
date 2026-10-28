"""
Paddock Trade (Mercado Global de Intercambios)
Implementa transacciones atómicas ACID para evitar duplicación de activos (duping):
- POST /api/trades/create: Crea una oferta 1 a 1 bloqueando/descontando unpasted_count del oferente.
- POST /api/trades/accept/{trade_id}: Realiza el trueque atómico de cartas entre 2 usuarios bajo un solo db.commit().
- GET /api/trades/active: Lista las ofertas activas en el mercado.
- POST /api/trades/cancel/{trade_id}: Cancela una oferta y devuelve la figurita al inventario.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import Trade, UserInventory, VehicleCatalog, User
from app.schemas.schemas import CreateTradeRequest, TradeOut, VehicleOut

router = APIRouter(prefix="/api/trades", tags=["Paddock Trade"])


@router.get("/active", response_model=List[TradeOut])
def get_active_trades(db: Session = Depends(get_db)):
    trades = db.query(Trade).filter(Trade.status == "OPEN").order_by(Trade.created_at.desc()).all()
    return trades


@router.post("/create", response_model=TradeOut)
def create_trade(
    payload: CreateTradeRequest,
    user_id: str = "pilot-1",
    db: Session = Depends(get_db)
):
    """
    Crea una oferta de intercambio en el mercado global.
    Bloqueo logístico: Descuenta temporalmente 1 del unpasted_count del usuario para evitar duplicación concurrente.
    """
    try:
        if payload.offer_vehicle_id == payload.request_vehicle_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No puedes solicitar el mismo vehículo que estás ofreciendo."
            )

        # 1. Validar inventario del oferente
        inv_item = db.query(UserInventory).filter_by(
            user_id=user_id,
            vehicle_id=payload.offer_vehicle_id
        ).first()

        if not inv_item or inv_item.unpasted_count < 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No posees unidades disponibles (unpasted) de este vehículo para comerciar."
            )

        # 2. Descontar preventivamente del inventario disponible para aislar la oferta (Anti-Duping)
        inv_item.unpasted_count -= 1

        trade = Trade(
            offer_user_id=user_id,
            offer_vehicle_id=payload.offer_vehicle_id,
            request_vehicle_id=payload.request_vehicle_id,
            status="OPEN"
        )
        db.add(trade)
        db.commit()
        db.refresh(trade)
        return trade

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al publicar oferta de trueque: {str(e)}"
        )


@router.post("/accept/{trade_id}")
def accept_trade(
    trade_id: str,
    acceptor_user_id: str = "pilot-2",  # Default acceptor for testing
    db: Session = Depends(get_db)
):
    """
    Transacción ACID Estricta de Trueque 1 a 1:
    - Asegura que el trade continúe OPEN.
    - Asegura que el aceptante posea la figurita solicitada.
    - Resta la figurita al aceptante.
    - Suma la figurita pedida al creador.
    - Suma la figurita ofrecida al aceptante.
    - Cierra el trade con status = 'MATCHED'.
    - db.commit() atómico. Rollback total si ocurre cualquier error.
    """
    try:
        trade = db.query(Trade).filter(Trade.trade_id == trade_id, Trade.status == "OPEN").first()
        if not trade:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La oferta de trueque ya no está disponible o ha sido completada."
            )

        if trade.offer_user_id == acceptor_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No puedes aceptar tu propia oferta de trueque."
            )

        # 1. Verificar inventario de quien acepta (acceptor)
        acceptor_item = db.query(UserInventory).filter_by(
            user_id=acceptor_user_id,
            vehicle_id=trade.request_vehicle_id
        ).first()

        if not acceptor_item or acceptor_item.unpasted_count < 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No tienes la figurita requerida para este intercambio."
            )

        creator_user_id = trade.offer_user_id

        # --- MUTACIÓN ATÓMICA DE INVENTARIOS ---
        # 2. Restar la figurita al que acepta
        acceptor_item.unpasted_count -= 1

        # 3. Sumar el auto pedido al creador de la oferta
        creator_receives = db.query(UserInventory).filter_by(
            user_id=creator_user_id,
            vehicle_id=trade.request_vehicle_id
        ).first()

        if creator_receives:
            creator_receives.unpasted_count += 1
        else:
            db.add(UserInventory(
                user_id=creator_user_id,
                vehicle_id=trade.request_vehicle_id,
                unpasted_count=1,
                is_pasted=False
            ))

        # 4. Sumar el auto ofrecido a quien acepta
        acceptor_receives = db.query(UserInventory).filter_by(
            user_id=acceptor_user_id,
            vehicle_id=trade.offer_vehicle_id
        ).first()

        if acceptor_receives:
            acceptor_receives.unpasted_count += 1
        else:
            db.add(UserInventory(
                user_id=acceptor_user_id,
                vehicle_id=trade.offer_vehicle_id,
                unpasted_count=1,
                is_pasted=False
            ))

        # 5. Cerrar la oferta
        trade.status = "MATCHED"

        # 6. Commit atómico
        db.commit()

        return {
            "status": "success",
            "message": "¡Trueque realizado con éxito! Inventarios actualizados atómicamente.",
            "trade_id": trade.trade_id
        }

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error transaccional, trueque cancelado: {str(e)}"
        )


@router.post("/cancel/{trade_id}")
def cancel_trade(
    trade_id: str,
    user_id: str = "pilot-1",
    db: Session = Depends(get_db)
):
    """
    Cancela una oferta y devuelve el vehículo comprometido al inventario del usuario.
    """
    try:
        trade = db.query(Trade).filter(
            Trade.trade_id == trade_id,
            Trade.offer_user_id == user_id,
            Trade.status == "OPEN"
        ).first()

        if not trade:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Oferta no encontrada o no pertenece al usuario."
            )

        # Devolver vehículo al unpasted_count
        inv_item = db.query(UserInventory).filter_by(
            user_id=user_id,
            vehicle_id=trade.offer_vehicle_id
        ).first()

        if inv_item:
            inv_item.unpasted_count += 1

        trade.status = "CANCELLED"
        db.commit()
        return {"status": "success", "message": "Oferta cancelada y figurita devuelta al garaje."}

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al cancelar oferta: {str(e)}"
        )
