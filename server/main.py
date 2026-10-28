"""
SpeedClub MVP - FastAPI Application Server
Provides REST API for:
- /api/catalog & /api/garage
- /api/un-crate & /api/paste-vehicle
- /api/sponsors (Anti-cheat real-time trailer sessions)
- /api/trades (ACID 1-to-1 Paddock Trade market)
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.database import engine, init_db, SessionLocal
from app.core.auth_service import hash_password
from app.api.auth import router as auth_router
from app.api.garage import router as garage_router
from app.api.unboxing import router as unboxing_router
from app.api.economy import router as economy_router
from app.api.trades import router as trades_router
from app.models.models import VehicleCatalog, User, PackInventory, UserInventory


def seed_database_if_empty():
    """Populates SQLite database with schema and seed_vehicles.sql if catalog is empty."""
    init_db()
    with SessionLocal() as db:
        # Migration: Ensure password_hash column exists in SQLite
        try:
            columns = [c[1] for c in db.execute(text("PRAGMA table_info(users)")).fetchall()]
            if "password_hash" not in columns:
                db.execute(text("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255)"))
                db.commit()
                print(">>> Columna 'password_hash' añadida a la tabla 'users'.")
        except Exception as e:
            print(f">>> Info migración users: {e}")

        count = db.query(VehicleCatalog).count()
        if count < 95:
            # Check candidate paths for seed_vehicles.sql
            candidate_paths = [
                os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "database", "seed_vehicles.sql")),
                os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "database", "seed_vehicles.sql"))
            ]
            for seed_sql_path in candidate_paths:
                if os.path.exists(seed_sql_path):
                    with open(seed_sql_path, "r", encoding="utf-8") as f:
                        sql_content = f.read()
                    statements = [s.strip() for s in sql_content.split(";") if s.strip()]
                    for stmt in statements:
                        db.execute(text(stmt))
                    db.commit()
                    print(f">>> Catalogo sembrado con éxito desde {seed_sql_path}.")
                    break

        # Seed initial demo user if needed
        demo_user = db.query(User).filter(User.id == "pilot-1").first()
        if not demo_user:
            demo_user = User(
                id="pilot-1",
                username="Ayrton Driver",
                email="ayrton@speedclub.io",
                password_hash=hash_password("speed2026"),
                racing_credits=500
            )
            db.add(demo_user)
            db.commit()
            print(">>> Usuario demo 'pilot-1' (500 CR) creado con password 'speed2026'.")
        elif not demo_user.password_hash:
            demo_user.password_hash = hash_password("speed2026")
            db.commit()

        # Seed second demo user for trade matchmaking
        demo_user2 = db.query(User).filter(User.id == "pilot-2").first()
        if not demo_user2:
            demo_user2 = User(
                id="pilot-2",
                username="Max Speed",
                email="max@speedclub.io",
                password_hash=hash_password("speed2026"),
                racing_credits=200
            )
            db.add(demo_user2)
            db.commit()

        # Ensure demo user pilot-1 has starter crates
        pilot1_packs = db.query(PackInventory).filter(PackInventory.user_id == "pilot-1").all()
        if not pilot1_packs:
            db.add(PackInventory(user_id="pilot-1", pack_type="Standard Crate", quantity=2))
            db.add(PackInventory(user_id="pilot-1", pack_type="Premium Crate", quantity=1))
            db.commit()

        # Ensure demo user pilot-1 has sample pasted & unpasted cards if empty
        pilot1_inv = db.query(UserInventory).filter(UserInventory.user_id == "pilot-1").all()
        if not pilot1_inv:
            # Seed 3 pasted vehicles in demo
            for v_id in [1, 12, 45]:
                db.add(UserInventory(user_id="pilot-1", vehicle_id=v_id, unpasted_count=0, is_pasted=True))
            # Seed unpasted cards
            for v_id, count in [(2, 1), (13, 1), (23, 1), (33, 2), (56, 1), (65, 1)]:
                db.add(UserInventory(user_id="pilot-1", vehicle_id=v_id, unpasted_count=count, is_pasted=False))
            db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize tables and seed data
    seed_database_if_empty()
    yield
    # Shutdown


app = FastAPI(
    title="SpeedClub API",
    description="SpeedClub MVP - Sistema Transaccional PWA de Colección y Mercado de Vehículos",
    version="1.0.0",
    lifespan=lifespan
)

# CORS setup for React Vite PWA
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router)
app.include_router(garage_router)
app.include_router(unboxing_router)
app.include_router(economy_router)
app.include_router(trades_router)


@app.get("/")
def root():
    return {
        "name": "SpeedClub API",
        "status": "online",
        "documentation": "/docs",
        "redoc": "/redoc"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
