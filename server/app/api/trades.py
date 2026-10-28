"""
Paddock Trade (Mercado Oficial de Permutas e Intercambios SpeedClub)
Implementa transacciones atómicas ACID para evitar duplicación de activos (anti-duping):
- Regla 1: Máximo 3 permutas publicadas cada 24 horas por piloto.
- Regla 2: Máximo 3 ofertas de permutas activas simultáneas en el mercado.
- Regla 3: Selección estricta de repetidas para entregar y faltantes del álbum para solicitar.
- Regla 4: Trueque atómico 1 a 1 bajo una sola transacción ACID de SQLite.
"""

from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from app.core.database import get_db
from app.models.models import Trade, UserInventory, VehicleCatalog, User
from app.schemas.schemas import (
    CreateTradeRequest,
    TradeOut,
    TradeStatusResponse,
    EligibleVehiclesResponse,
    VehicleOut
)

router = APIRouter(prefix="/api/trades", tags=["Paddock Trade"])


@router.get("/status", response_model=TradeStatusResponse)
def get_trade_status(
    user_id: str = Query("pilot-1", description="ID de piloto autenticado"),
    db: Session = Depends(get_db)
):
    """
    Devuelve la cuota del piloto:
    - Ofertas creadas en las últimas 24 horas (máx 3).
    - Ofertas activas simultáneas en el mercado (máx 3).
    - Segundos restantes de cooldown si se alcanzó la cuota de 3.
    """
    now = datetime.utcnow()
    window_start = now - timedelta(hours=24)

    # 1. Permutas creadas en las últimas 24 horas
    trades_in_24h = db.query(Trade).filter(
        Trade.offer_user_id == user_id,
        Trade.created_at >= window_start
    ).order_by(Trade.created_at.asc()).all()

    trades_created_in_window = len(trades_in_24h)

    # 2. Permutas activas simultáneas actualmente abiertas
    active_trades_count = db.query(Trade).filter(
        Trade.offer_user_id == user_id,
        Trade.status == "OPEN"
    ).count()

    # 3. Determinar si puede publicar
    can_create = (trades_created_in_window < 3) and (active_trades_count < 3)

    # 4. Calcular tiempo de enfriamiento si alcanzó el cupo de 3 en 24h
    cooldown_seconds = 0
    if trades_created_in_window >= 3 and trades_in_24h:
        oldest_trade = trades_in_24h[0]
        expires_at = oldest_trade.created_at + timedelta(hours=24)
        if expires_at > now:
            cooldown_seconds = int((expires_at - now).total_seconds())

    message = "Cuota disponible para publicar permutas."
    if active_trades_count >= 3:
        message = "Tienes 3 ofertas de permuta activas simultáneas. Espera a que se complete una o cancela una para publicar."
    elif trades_created_in_window >= 3:
        message = f"Has alcanzado tu límite de 3 permutas cada 24 horas. Próximo cupo en {cooldown_seconds // 3600}h {(cooldown_seconds % 3600) // 60}m."

    return TradeStatusResponse(
        can_create_trade=can_create,
        trades_created_in_window=trades_created_in_window,
        active_trades_count=active_trades_count,
        max_daily_trades=3,
        max_active_trades=3,
        cooldown_remaining_seconds=cooldown_seconds,
        message=message
    )


@router.get("/eligible-vehicles")
def get_eligible_vehicles(
    user_id: str = Query("pilot-1", description="ID de piloto autenticado"),
    db: Session = Depends(get_db)
):
    """
    Devuelve:
    1. duplicates_to_give: figuritas que el piloto posee en su inventario con unpasted_count >= 1 (repetidas).
    2. missing_to_request: figuritas del catálogo oficial de 95 vehículos que el piloto NO tiene pegadas en su álbum.
    """
    # 1. Inventario del usuario
    user_inv = db.query(UserInventory).filter_by(user_id=user_id).all()
    inv_map = {item.vehicle_id: item for item in user_inv}

    # 2. Catálogo maestro completo
    catalog = db.query(VehicleCatalog).order_by(VehicleCatalog.id.asc()).all()

    # Figuritas repetidas para dar (unpasted_count >= 1)
    duplicates_to_give = []
    for item in user_inv:
        if item.unpasted_count >= 1 and item.vehicle:
            # Determinamos si es repetida estricta (ya pegada en álbum o tiene más de 1)
            is_strict_duplicate = item.is_pasted or item.unpasted_count > 1
            duplicates_to_give.append({
                "id": item.vehicle.id,
                "name": item.vehicle.name,
                "category": item.vehicle.category,
                "rarity_tier": item.vehicle.rarity_tier,
                "tier": item.vehicle.rarity_tier,
                "image": item.vehicle.image_url,
                "image_url": item.vehicle.image_url,
                "unpasted_count": item.unpasted_count,
                "is_pasted": item.is_pasted,
                "is_strict_duplicate": is_strict_duplicate
            })

    # Figuritas que el piloto NO tiene en su álbum (para solicitar)
    missing_to_request = []
    for v in catalog:
        user_item = inv_map.get(v.id)
        # Falta en el álbum si no existe en user_inv o is_pasted == False
        if not user_item or not user_item.is_pasted:
            missing_to_request.append({
                "id": v.id,
                "name": v.name,
                "category": v.category,
                "rarity_tier": v.rarity_tier,
                "tier": v.rarity_tier,
                "image": v.image_url,
                "image_url": v.image_url,
                "already_in_inventory": (user_item.unpasted_count > 0) if user_item else False
            })

    return {
        "duplicates_to_give": duplicates_to_give,
        "missing_to_request": missing_to_request
    }


@router.get("/active")
def get_active_trades(
    user_id: Optional[str] = Query(None, description="ID del piloto que consulta"),
    filter_category: Optional[str] = Query(None, description="Filtrar por categoría / temática"),
    search: Optional[str] = Query(None, description="Búsqueda por texto"),
    only_can_accept: bool = Query(False, description="Solo permutas que el usuario puede realizar"),
    db: Session = Depends(get_db)
):
    """
    Lista las ofertas de permuta activas ('OPEN') en el mercado global.
    Calcula para cada una si el piloto que consulta puede aceptarla de inmediato.
    """
    query = db.query(Trade).filter(Trade.status == "OPEN").order_by(Trade.created_at.desc())

    trades = query.all()

    # Obtener inventario del piloto que consulta para evaluar compatibilidad
    viewer_unpasted = {}
    if user_id:
        viewer_items = db.query(UserInventory).filter_by(user_id=user_id).all()
        for item in viewer_items:
            viewer_unpasted[item.vehicle_id] = item.unpasted_count

    result = []
    for t in trades:
        # Validar relaciones
        offer_v = t.offer_vehicle
        request_v = t.request_vehicle
        offer_u = t.offer_user

        if not offer_v or not request_v:
            continue

        offer_user_name = offer_u.username if offer_u else "Piloto Anónimo"
        is_own_trade = (user_id and t.offer_user_id == user_id)
        viewer_has_duplicates = viewer_unpasted.get(t.request_vehicle_id, 0)
        can_accept = (not is_own_trade) and (viewer_has_duplicates >= 1)

        # Filtro por categoría
        if filter_category and filter_category != "all" and filter_category != "TODAS":
            cat_match = (
                offer_v.category.lower() == filter_category.lower() or
                request_v.category.lower() == filter_category.lower()
            )
            if not cat_match:
                continue

        # Filtro por búsqueda
        if search and search.strip():
            s = search.strip().lower()
            text_match = (
                s in offer_v.name.lower() or
                s in request_v.name.lower() or
                s in offer_user_name.lower() or
                s in offer_v.category.lower() or
                s in request_v.category.lower()
            )
            if not text_match:
                continue

        # Filtro de solo realizables
        if only_can_accept and not can_accept:
            continue

        result.append({
            "trade_id": t.trade_id,
            "offer_user_id": t.offer_user_id,
            "offer_user_name": offer_user_name,
            "offer_vehicle": {
                "id": offer_v.id,
                "name": offer_v.name,
                "category": offer_v.category,
                "rarity_tier": offer_v.rarity_tier,
                "image_url": offer_v.image_url
            },
            "request_vehicle": {
                "id": request_v.id,
                "name": request_v.name,
                "category": request_v.category,
                "rarity_tier": request_v.rarity_tier,
                "image_url": request_v.image_url
            },
            "status": t.status,
            "created_at": t.created_at.isoformat(),
            "is_own_trade": is_own_trade,
            "can_accept": can_accept,
            "viewer_has_duplicates": viewer_has_duplicates
        })

    return result


@router.get("/my-trades")
def get_my_trades(
    user_id: str = Query("pilot-1", description="ID de piloto"),
    db: Session = Depends(get_db)
):
    """
    Retorna el resumen de permutas de un usuario:
    - Activas (publicadas por él y aún abiertas).
    - Completadas (como oferente o como aceptante).
    - Canceladas.
    """
    trades = db.query(Trade).filter(
        or_(Trade.offer_user_id == user_id, Trade.acceptor_user_id == user_id)
    ).order_by(Trade.created_at.desc()).all()

    active = []
    completed = []
    cancelled = []

    for t in trades:
        offer_v = t.offer_vehicle
        request_v = t.request_vehicle
        offer_u = t.offer_user
        acceptor_u = t.acceptor_user

        if not offer_v or not request_v:
            continue

        item = {
            "trade_id": t.trade_id,
            "offer_user_id": t.offer_user_id,
            "offer_user_name": offer_u.username if offer_u else "Piloto",
            "acceptor_user_id": t.acceptor_user_id,
            "acceptor_user_name": acceptor_u.username if acceptor_u else None,
            "offer_vehicle": {
                "id": offer_v.id,
                "name": offer_v.name,
                "category": offer_v.category,
                "rarity_tier": offer_v.rarity_tier,
                "image_url": offer_v.image_url
            },
            "request_vehicle": {
                "id": request_v.id,
                "name": request_v.name,
                "category": request_v.category,
                "rarity_tier": request_v.rarity_tier,
                "image_url": request_v.image_url
            },
            "status": t.status,
            "created_at": t.created_at.isoformat(),
            "matched_at": t.matched_at.isoformat() if t.matched_at else None,
            "is_creator": (t.offer_user_id == user_id)
        }

        if t.status == "OPEN" and t.offer_user_id == user_id:
            active.append(item)
        elif t.status == "MATCHED":
            completed.append(item)
        elif t.status == "CANCELLED" and t.offer_user_id == user_id:
            cancelled.append(item)

    return {
        "active": active,
        "completed": completed,
        "cancelled": cancelled
    }


@router.post("/create")
def create_trade(
    payload: CreateTradeRequest,
    user_id: str = Query("pilot-1", description="ID de piloto"),
    db: Session = Depends(get_db)
):
    """
    Crea una oferta de permuta en el mercado con validación estricta:
    1. Máximo 3 permutas creadas en las últimas 24hs.
    2. Máximo 3 permutas activas simultáneas.
    3. Bloqueo logístico preventivo (Anti-Duping): resta 1 al unpasted_count del oferente.
    """
    try:
        user = db.query(User).filter_by(id=user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Piloto no registrado en el sistema."
            )

        if payload.offer_vehicle_id == payload.request_vehicle_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No puedes solicitar el mismo vehículo que estás entregando."
            )

        # 1. Validar cuota de 3 en 24 horas
        now = datetime.utcnow()
        window_start = now - timedelta(hours=24)
        trades_in_24h_count = db.query(Trade).filter(
            Trade.offer_user_id == user_id,
            Trade.created_at >= window_start
        ).count()

        if trades_in_24h_count >= 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Has alcanzado tu límite máximo de 3 permutas cada 24 horas."
            )

        # 2. Validar cuota de 3 ofertas simultáneas activas
        active_trades_count = db.query(Trade).filter(
            Trade.offer_user_id == user_id,
            Trade.status == "OPEN"
        ).count()

        if active_trades_count >= 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya posees 3 ofertas de permuta activas simultáneamente en el Paddock."
            )

        # 3. Validar inventario del oferente
        inv_item = db.query(UserInventory).filter_by(
            user_id=user_id,
            vehicle_id=payload.offer_vehicle_id
        ).first()

        if not inv_item or inv_item.unpasted_count < 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No posees copias disponibles de este vehículo para intercambiar."
            )

        # 4. Descontar preventivamente para evitar duplicación (Anti-Duping)
        inv_item.unpasted_count -= 1

        # 5. Crear la permuta
        trade = Trade(
            offer_user_id=user_id,
            offer_vehicle_id=payload.offer_vehicle_id,
            request_vehicle_id=payload.request_vehicle_id,
            status="OPEN"
        )
        db.add(trade)
        db.commit()
        db.refresh(trade)

        return {
            "status": "success",
            "message": "¡Permuta agregada con éxito al mercado oficial!",
            "trade_id": trade.trade_id,
            "offer_vehicle_id": trade.offer_vehicle_id,
            "request_vehicle_id": trade.request_vehicle_id,
            "trades_created_today": trades_in_24h_count + 1,
            "active_trades_count": active_trades_count + 1
        }

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al publicar permuta: {str(e)}"
        )


@router.post("/accept/{trade_id}")
def accept_trade(
    trade_id: str,
    acceptor_user_id: str = Query("pilot-2", description="ID del piloto que acepta"),
    db: Session = Depends(get_db)
):
    """
    Transacción ACID Atómica de Intercambio 1 a 1:
    - Asegura que el trade continúe OPEN.
    - Asegura que el aceptante no sea el propio oferente.
    - Asegura que el aceptante posea la figurita requerida (unpasted_count >= 1).
    - Descuenta 1 al aceptante del auto solicitado.
    - Suma 1 al aceptante del auto ofrecido (unpasted_count += 1, is_pasted = False).
    - Suma 1 al oferente del auto solicitado (unpasted_count += 1, is_pasted = False).
    - Marca el trade como 'MATCHED' y fija acceptor_user_id y matched_at.
    - Commit ACID único. Rollback automático ante cualquier fallo.
    """
    try:
        trade = db.query(Trade).filter(Trade.trade_id == trade_id, Trade.status == "OPEN").first()
        if not trade:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La oferta de permuta ya no se encuentra disponible o ha sido completada."
            )

        if trade.offer_user_id == acceptor_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No puedes realizar un intercambio con tu propia oferta."
            )

        # 1. Validar inventario del aceptante
        acceptor_item = db.query(UserInventory).filter_by(
            user_id=acceptor_user_id,
            vehicle_id=trade.request_vehicle_id
        ).first()

        if not acceptor_item or acceptor_item.unpasted_count < 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No tienes la figurita requerida en tus repetidas para realizar este intercambio."
            )

        creator_user_id = trade.offer_user_id

        # 2. Descontar la figurita requerida al aceptante
        acceptor_item.unpasted_count -= 1

        # 3. Acreditar la figurita solicitada al creador de la oferta
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

        # 4. Acreditar la figurita ofrecida al aceptante
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

        # 5. Cerrar la permuta
        trade.status = "MATCHED"
        trade.acceptor_user_id = acceptor_user_id
        trade.matched_at = datetime.utcnow()

        # 6. Commit atómico
        db.commit()

        # Datos para la notificación
        rec_v = trade.offer_vehicle
        give_v = trade.request_vehicle

        return {
            "status": "success",
            "message": "¡Intercambio realizado con éxito! La figurita obtenida ha sido agregada a tu garaje.",
            "trade_id": trade.trade_id,
            "received_vehicle": {
                "id": rec_v.id if rec_v else trade.offer_vehicle_id,
                "name": rec_v.name if rec_v else "Vehículo",
                "category": rec_v.category if rec_v else "",
                "rarity_tier": rec_v.rarity_tier if rec_v else "C",
                "image_url": rec_v.image_url if rec_v else ""
            },
            "given_vehicle": {
                "id": give_v.id if give_v else trade.request_vehicle_id,
                "name": give_v.name if give_v else "Vehículo",
                "category": give_v.category if give_v else "",
                "rarity_tier": give_v.rarity_tier if give_v else "C",
                "image_url": give_v.image_url if give_v else ""
            }
        }

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error transaccional en intercambio: {str(e)}"
        )


@router.post("/cancel/{trade_id}")
def cancel_trade(
    trade_id: str,
    user_id: str = Query("pilot-1", description="ID de piloto"),
    db: Session = Depends(get_db)
):
    """
    Cancela una oferta propia abierta y devuelve la figurita retenida al garaje del piloto.
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
                detail="Oferta no encontrada, ya completada o no pertenece al piloto."
            )

        # Devolver vehículo al unpasted_count
        inv_item = db.query(UserInventory).filter_by(
            user_id=user_id,
            vehicle_id=trade.offer_vehicle_id
        ).first()

        if inv_item:
            inv_item.unpasted_count += 1
        else:
            db.add(UserInventory(
                user_id=user_id,
                vehicle_id=trade.offer_vehicle_id,
                unpasted_count=1,
                is_pasted=False
            ))

        trade.status = "CANCELLED"
        db.commit()

        return {
            "status": "success",
            "message": "Oferta cancelada con éxito y figurita devuelta a tu garaje."
        }

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al cancelar permuta: {str(e)}"
        )
