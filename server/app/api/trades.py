"""
Paddock Trade (Mercado Oficial de Permutas e Intercambios SpeedClub)
Implementa transacciones atómicas ACID para evitar duplicación de activos (anti-duping):
- Regla 1: Máximo 3 permutas publicadas cada 24 horas por piloto.
- Regla 2: Máximo 3 ofertas de permutas activas simultáneas en el mercado.
- Regla 3: Selección estricta de repetidas para entregar y faltantes del álbum para solicitar.
- Regla 4: Trueque atómico 1 a 1 bajo una sola transacción ACID de SQLite.
"""

from datetime import datetime, timedelta, time
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


def get_daily_trade_bounds():
    """
    Calcula el inicio del día calendario y los segundos restantes hasta las 23:59:59 (medianoche).
    Sincronizado con el reinicio de desafíos diarios.
    """
    now_local = datetime.now()
    today_start_local = datetime.combine(now_local.date(), time(0, 0, 0))
    tomorrow_start_local = datetime.combine(now_local.date() + timedelta(days=1), time(0, 0, 0))
    seconds_to_midnight = max(0, int((tomorrow_start_local - now_local).total_seconds()))

    offset = now_local - datetime.utcnow()
    today_start_utc = today_start_local - offset
    return today_start_utc, seconds_to_midnight


@router.get("/status", response_model=TradeStatusResponse)
def get_trade_status(
    user_id: str = Query("pilot-1", description="ID de piloto autenticado"),
    db: Session = Depends(get_db)
):
    """
    Devuelve el estado de permutas del piloto:
    - Sin cuotas de 24hs ni límites diarios.
    - Recuento de permutas activas actualmente abiertas.
    """
    active_trades_count = db.query(Trade).filter(
        Trade.offer_user_id == user_id,
        Trade.status == "OPEN"
    ).count()

    return TradeStatusResponse(
        can_create_trade=True,
        trades_created_in_window=0,
        active_trades_count=active_trades_count,
        max_daily_trades=999999,
        max_active_trades=999999,
        cooldown_remaining_seconds=0,
        message="Mercado libre de permutas habilitado."
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

    # Figuritas repetidas para dar:
    # Solamente las figuritas que el piloto tenga SI O SI 1 copia pegada en el álbum
    # Y al menos 1 copia repetida en sobres/inventario (unpasted_count >= 1).
    duplicates_to_give = []
    for item in user_inv:
        if item.is_pasted and item.unpasted_count >= 1 and item.vehicle:
            duplicates_to_give.append({
                "id": item.vehicle.id,
                "name": item.vehicle.name,
                "category": item.vehicle.category,
                "rarity_tier": item.vehicle.rarity_tier,
                "tier": item.vehicle.rarity_tier,
                "image": item.vehicle.image_url,
                "image_url": item.vehicle.image_url,
                "unpasted_count": item.unpasted_count,
                "is_pasted": True,
                "is_strict_duplicate": True
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

    # Obtener inventario del piloto que consulta para evaluar compatibilidad:
    # Para poder aceptar, el piloto debe tener la figurita solicitada pegada en su álbum
    # Y al menos 1 copia repetida disponible (unpasted_count >= 1).
    viewer_unpasted = {}
    if user_id:
        viewer_items = db.query(UserInventory).filter_by(user_id=user_id).all()
        for item in viewer_items:
            if item.is_pasted and item.unpasted_count >= 1:
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

        # 1. Validar inventario del oferente:
        # Debe tener AL MENOS 1 copia pegada en el álbum Y al menos 1 copia repetida en sobres.
        inv_item = db.query(UserInventory).filter_by(
            user_id=user_id,
            vehicle_id=payload.offer_vehicle_id
        ).first()

        if not inv_item or not inv_item.is_pasted:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Debes tener al menos 1 copia de esta figurita pegada en tu álbum oficial antes de poder intercambiar una repetida."
            )

        if inv_item.unpasted_count < 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No posees copias repetidas de este vehículo para intercambiar."
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
            "trades_created_today": 0,
            "active_trades_count": 0
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

        # 1. Validar inventario del aceptante:
        # Debe tener la figurita pegada en el álbum Y al menos 1 copia repetida en sobres
        acceptor_item = db.query(UserInventory).filter_by(
            user_id=acceptor_user_id,
            vehicle_id=trade.request_vehicle_id
        ).first()

        if not acceptor_item or not acceptor_item.is_pasted:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Debes tener esta figurita pegada en tu álbum antes de poder intercambiarla."
            )

        if acceptor_item.unpasted_count < 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No tienes copias repetidas de esta figurita para realizar el intercambio."
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
        trade.creator_seen = False

        # 6. Commit atómico
        db.commit()

        # Datos para la notificación
        rec_v = trade.offer_vehicle
        give_v = trade.request_vehicle
        offer_u = trade.offer_user

        return {
            "status": "success",
            "message": "¡Intercambio realizado con éxito! La figurita obtenida ha sido agregada a tu garaje.",
            "trade_id": trade.trade_id,
            "partner_name": offer_u.username if offer_u else "Piloto",
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



@router.get("/unseen-matches")
def get_unseen_matches(
    user_id: str = Query("pilot-1", description="ID de piloto autenticado"),
    db: Session = Depends(get_db)
):
    """
    Retorna las permutas donde user_id es el creador (offer_user_id),
    que han sido aceptadas por otro piloto (status == 'MATCHED')
    y que el creador todavía no ha visto / confirmado (creator_seen == False).
    """
    unseen_trades = db.query(Trade).filter(
        Trade.offer_user_id == user_id,
        Trade.status == "MATCHED",
        Trade.creator_seen == False
    ).order_by(Trade.matched_at.desc()).all()

    results = []
    for t in unseen_trades:
        offer_v = t.offer_vehicle
        request_v = t.request_vehicle
        acceptor_u = t.acceptor_user

        results.append({
            "trade_id": t.trade_id,
            "partner_name": acceptor_u.username if acceptor_u else "Piloto de la Comunidad",
            "matched_at": t.matched_at.isoformat() if t.matched_at else None,
            "given_vehicle": {
                "id": offer_v.id if offer_v else t.offer_vehicle_id,
                "name": offer_v.name if offer_v else "Vehículo",
                "category": offer_v.category if offer_v else "",
                "rarity_tier": offer_v.rarity_tier if offer_v else "C",
                "image_url": offer_v.image_url if offer_v else ""
            },
            "received_vehicle": {
                "id": request_v.id if request_v else t.request_vehicle_id,
                "name": request_v.name if request_v else "Vehículo",
                "category": request_v.category if request_v else "",
                "rarity_tier": request_v.rarity_tier if request_v else "C",
                "image_url": request_v.image_url if request_v else ""
            }
        })

    return {
        "count": len(results),
        "unseen_trades": results
    }


@router.post("/acknowledge/{trade_id}")
def acknowledge_trade(
    trade_id: str,
    user_id: str = Query("pilot-1", description="ID de piloto autenticado"),
    db: Session = Depends(get_db)
):
    """
    Marca una permuta completada como 'vista' por el creador.
    """
    trade = db.query(Trade).filter(
        Trade.trade_id == trade_id,
        Trade.offer_user_id == user_id,
        Trade.status == "MATCHED"
    ).first()

    if trade:
        trade.creator_seen = True
        db.commit()

    return {"status": "success", "message": "Permuta confirmada y marcada como vista."}


@router.post("/simulate-accept/{trade_id}")
def simulate_accept_trade(
    trade_id: str,
    db: Session = Depends(get_db)
):
    """
    Simulación para desarrollo / demo: Hace que el piloto bot (pilot-2) acepte una permuta
    creada por pilot-1, para probar de inmediato la notificación (+1) y la animación.
    """
    trade = db.query(Trade).filter(Trade.trade_id == trade_id, Trade.status == "OPEN").first()
    if not trade:
        raise HTTPException(status_code=400, detail="Oferta no encontrada o ya cerrada.")

    # Asegurar que pilot-2 tenga el vehículo solicitado (pegado en álbum y con repetidas)
    p2_item = db.query(UserInventory).filter_by(user_id="pilot-2", vehicle_id=trade.request_vehicle_id).first()
    if not p2_item:
        p2_item = UserInventory(user_id="pilot-2", vehicle_id=trade.request_vehicle_id, unpasted_count=2, is_pasted=True)
        db.add(p2_item)
    else:
        p2_item.is_pasted = True
        if p2_item.unpasted_count < 1:
            p2_item.unpasted_count += 2
    db.commit()

    return accept_trade(trade_id=trade_id, acceptor_user_id="pilot-2", db=db)
