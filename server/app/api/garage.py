"""
Garage & Catalog API Endpoints
Provides endpoints to fetch:
- GET /api/garage: Profile, credits, unopened crates, pasted vehicles and unpasted inventory.
- GET /api/catalog: Complete master catalog with all tiers and categories.
"""

from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import User, VehicleCatalog, UserInventory, PackInventory
from app.schemas.schemas import VehicleOut

router = APIRouter(prefix="/api", tags=["Garage & Catalog"])


@router.get("/catalog", response_model=List[VehicleOut])
def get_catalog(db: Session = Depends(get_db)):
    """Retorna todo el catálogo de 20 vehículos maestro."""
    return db.query(VehicleCatalog).order_by(VehicleCatalog.id.asc()).all()


@router.get("/garage")
def get_user_garage(user_id: str = "pilot-1", db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Retorna el estado completo del garaje del usuario:
    - Billetera de créditos (racing_credits)
    - Sobres sin abrir (unopened_crates)
    - Vehículos pegados en el álbum (pasted_vehicles)
    - Inventario de figuritas disponibles (inventory)
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = User(
            id=user_id,
            username="Piloto Principal",
            email="piloto@speedclub.io",
            racing_credits=300
        )
        db.add(user)
        # Give 1 starter crate
        starter_pack = PackInventory(user_id=user_id, pack_type="Standard Crate", quantity=1)
        db.add(starter_pack)
        db.commit()
        db.refresh(user)

    packs = db.query(PackInventory).filter(PackInventory.user_id == user_id).all()
    pack_map = {p.pack_type: p.quantity for p in packs}
    standard_count = pack_map.get("Standard Crate", 0)
    premium_count = pack_map.get("Premium Crate", 0)
    crate_count = sum(p.quantity for p in packs)

    inventory_rows = (
        db.query(UserInventory, VehicleCatalog)
        .join(VehicleCatalog, UserInventory.vehicle_id == VehicleCatalog.id)
        .filter(UserInventory.user_id == user_id)
        .all()
    )

    pasted_vehicles = []
    inventory = []

    for inv, vehicle in inventory_rows:
        v_data = {
            "id": vehicle.id,
            "name": vehicle.name,
            "category": vehicle.category,
            "rarity_tier": vehicle.rarity_tier,
            "tier": vehicle.rarity_tier,
            "image_url": vehicle.image_url,
            "image": vehicle.image_url,
            "unpasted_count": inv.unpasted_count,
            "count": inv.unpasted_count,
            "is_pasted": inv.is_pasted
        }
        if inv.is_pasted:
            pasted_vehicles.append(v_data)
        if inv.unpasted_count > 0:
            inventory.append(v_data)

    return {
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
        },
        "racing_credits": user.racing_credits,
        "unopened_crates": crate_count,
        "containers": {
            "standard": standard_count,
            "premium": premium_count
        },
        "pasted_vehicles": pasted_vehicles,
        "inventory": inventory
    }
