"""
RNG Engine (Motor de Probabilidades) para SpeedClub
Implementa el algoritmo de Drop Rate ponderado (Weighted RNG):
- Tier C (Urbano/Común): 70%
- Tier B (Deportivo/Raro): 20%
- Tier A (Superdeportivo/Épico): 9%
- Tier S (Hipercoche/Legendario): 1%

Estrategia en dos fases:
1. Sortear la Rareza mediante random.choices con pesos.
2. Sortear el Vehículo dentro de esa rareza consultando el catálogo.
"""

import random
from typing import List
from sqlalchemy.orm import Session
from app.models.models import VehicleCatalog

# Configuración de los Drop Rates
TIER_WEIGHTS = {
    "C": 70.0,
    "B": 20.0,
    "A": 9.0,
    "S": 1.0
}


def generate_pack_drop(db: Session, pack_size: int = 5) -> List[VehicleCatalog]:
    """
    Algoritmo central para la apertura de una Caja de Importación / Sobre.
    Retorna una lista con los 5 objetos VehicleCatalog obtenidos.
    """
    tiers = list(TIER_WEIGHTS.keys())
    weights = list(TIER_WEIGHTS.values())

    # 1. Sortear las 5 rarezas basándose en los pesos configurados
    rolled_tiers = random.choices(tiers, weights=weights, k=pack_size)

    obtained_vehicles = []

    # 2. Por cada rareza sorteada, buscar un auto aleatorio de esa categoría
    for tier in rolled_tiers:
        vehicles_in_tier = db.query(VehicleCatalog).filter(VehicleCatalog.rarity_tier == tier).all()
        if vehicles_in_tier:
            chosen_vehicle = random.choice(vehicles_in_tier)
            obtained_vehicles.append(chosen_vehicle)
        else:
            # Fallback de seguridad en caso de catálogo incompleto en algún tier
            fallback_vehicle = db.query(VehicleCatalog).first()
            if fallback_vehicle:
                obtained_vehicles.append(fallback_vehicle)

    return obtained_vehicles
