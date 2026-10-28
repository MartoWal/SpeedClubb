"""
Unboxing API Endpoints
Implements ACID atomic crate opening with Drop Rate probability engine:
- POST /api/un-crate: Deducts crate or 100 CR, rolls 5 cards using rng_engine,
  and updates user_inventory atomically in a single db.commit() with db.rollback() protection.
- POST /api/paste-vehicle: Sticks an unpasted sticker into the album (is_pasted = True, unpasted_count -= 1).
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.rng_engine import generate_pack_drop
from app.models.models import User, UserInventory, PackInventory, VehicleCatalog
from app.schemas.schemas import VehicleOut, PasteVehicleRequest, UnboxResponse

router = APIRouter(prefix="/api", tags=["Unboxing & Garage"])

CRATE_COST = 100


@router.post("/un-crate", response_model=UnboxResponse)
def open_crate(
    user_id: str = "pilot-1",
    pack_type: str = "standard",
    db: Session = Depends(get_db)
):
    """
    Abre un sobre container:
    - standard: cuesta 100 CR o 1 sobre Standard Crate, otorga 3 figuritas.
    - premium: cuesta 500 CR o 1 sobre Premium Crate, otorga 5 figuritas.
    Transacción ACID con commit atómico y rollback.
    """
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            user = User(id=user_id, username="Piloto Principal", email="piloto@speedclub.io", racing_credits=500)
            db.add(user)
            db.flush()

        is_premium = (pack_type.lower() == "premium")
        cost = 500 if is_premium else 100
        target_pack_type = "Premium Crate" if is_premium else "Standard Crate"
        pack_size = 5 if is_premium else 3

        # Verificar si tiene el sobre correspondiente en su inventario
        pack = db.query(PackInventory).filter(
            PackInventory.user_id == user_id,
            PackInventory.pack_type == target_pack_type,
            PackInventory.quantity > 0
        ).first()

        if pack and pack.quantity > 0:
            pack.quantity -= 1
        elif user.racing_credits >= cost:
            user.racing_credits -= cost
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Créditos insuficientes ({user.racing_credits} CR). Se requieren {cost} CR para abrir este container."
            )

        # Generar el Drop de vehículos
        new_vehicles = generate_pack_drop(db, pack_size=pack_size)

        # Inyectar vehículos en el inventario dentro de la transacción
        # Contamos cuántas veces salió cada auto en esta apertura para manejar duplicados dentro del mismo sobre
        drop_counts = {}
        for vehicle in new_vehicles:
            drop_counts[vehicle.id] = drop_counts.get(vehicle.id, 0) + 1

        for v_id, count in drop_counts.items():
            inventory_item = db.query(UserInventory).filter_by(
                user_id=user_id,
                vehicle_id=v_id
            ).first()

            if inventory_item:
                inventory_item.unpasted_count += count
            else:
                new_item = UserInventory(
                    user_id=user_id,
                    vehicle_id=v_id,
                    unpasted_count=count,
                    is_pasted=False
                )
                db.add(new_item)

        # Commit atómico
        db.commit()
        db.refresh(user)

        packs = db.query(PackInventory).filter(PackInventory.user_id == user_id).all()
        pack_map = {p.pack_type: p.quantity for p in packs}
        total_crates = sum(p.quantity for p in packs)

        dropped_out = [
            VehicleOut(
                id=v.id,
                name=v.name,
                category=v.category,
                rarity_tier=v.rarity_tier,
                image_url=v.image_url,
                image=v.image_url
            ) for v in new_vehicles
        ]

        return UnboxResponse(
            status="success",
            vehicles_dropped=dropped_out,
            racing_credits=user.racing_credits,
            unopened_crates=total_crates,
            containers={
                "standard": pack_map.get("Standard Crate", 0),
                "premium": pack_map.get("Premium Crate", 0)
            },
            message=f"Container abierto con éxito. ¡+{len(new_vehicles)} figuritas añadidas a tu inventario!"
        )

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en la transacción de apertura: {str(e)}"
        )


@router.post("/buy-container")
def buy_container(
    user_id: str = "pilot-1",
    pack_type: str = "standard",
    db: Session = Depends(get_db)
):
    """
    Compra un sobre container y lo almacena en la tabla PackInventory de SQLite.
    - standard: 100 CR
    - premium: 500 CR
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    is_premium = (pack_type.lower() == "premium")
    cost = 500 if is_premium else 100
    target_type = "Premium Crate" if is_premium else "Standard Crate"

    if user.racing_credits < cost:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Créditos insuficientes ({user.racing_credits} CR). Se requieren {cost} CR."
        )

    user.racing_credits -= cost

    pack = db.query(PackInventory).filter(
        PackInventory.user_id == user_id,
        PackInventory.pack_type == target_type
    ).first()

    if pack:
        pack.quantity += 1
    else:
        pack = PackInventory(user_id=user_id, pack_type=target_type, quantity=1)
        db.add(pack)

    db.commit()
    db.refresh(user)

    packs = db.query(PackInventory).filter(PackInventory.user_id == user_id).all()
    pack_map = {p.pack_type: p.quantity for p in packs}

    return {
        "status": "success",
        "racing_credits": user.racing_credits,
        "containers": {
            "standard": pack_map.get("Standard Crate", 0),
            "premium": pack_map.get("Premium Crate", 0)
        },
        "unopened_crates": sum(p.quantity for p in packs),
        "message": f"Container {target_type} adquirido exitosamente (+1 en inventario)."
    }


@router.post("/paste-vehicle")
def paste_vehicle(
    payload: PasteVehicleRequest,
    user_id: str = "pilot-1",
    db: Session = Depends(get_db)
):
    """
    Pega una figurita en el álbum digital.
    Disminuye unpasted_count en 1 y marca is_pasted = True.
    """
    try:
        inv_item = db.query(UserInventory).filter_by(
            user_id=user_id,
            vehicle_id=payload.vehicle_id
        ).first()

        if not inv_item or inv_item.unpasted_count <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No posees unidades sin pegar de este vehículo para colocar en el álbum."
            )

        if inv_item.is_pasted:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Este vehículo ya se encuentra pegado en el álbum."
            )

        inv_item.unpasted_count -= 1
        inv_item.is_pasted = True

        db.commit()
        return {"status": "success", "message": "Vehículo pegado exitosamente en el álbum.", "vehicle_id": payload.vehicle_id}

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en la transacción de pegado: {str(e)}"
        )
