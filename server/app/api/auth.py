"""
Authentication Router for SpeedClub.
Provides:
- POST /api/auth/register: Create a new driver account with welcome bonus (500 CR + starter packs).
- POST /api/auth/login: Authenticate driver using email & password.
- GET /api/auth/me: Retrieve active driver profile.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid

from app.core.database import get_db
from app.core.auth_service import hash_password, verify_password
from app.models.models import User, PackInventory
from app.schemas.schemas import UserRegisterRequest, UserLoginRequest, AuthResponse, UserOut

router = APIRouter(prefix="/api/auth", tags=["Pilot Authentication"])


@router.post("/register", response_model=AuthResponse)
def register_driver(payload: UserRegisterRequest, db: Session = Depends(get_db)):
    """
    Registra una nueva Licencia de Piloto en el Paddock de SpeedClub.
    Otorga:
    - 500 Créditos de Carrera iniciales.
    - 2 Sobres Containers Comunes (Standard Crate).
    - 1 Sobre Container VIP Oro (Premium Crate).
    """
    clean_email = payload.email.lower().strip()
    clean_username = payload.username.strip()

    if len(clean_username) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre de piloto debe tener al menos 2 caracteres."
        )

    if len(payload.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña de telemetría debe tener al menos 6 caracteres."
        )

    existing_user = db.query(User).filter(User.email == clean_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe una Licencia de Piloto registrada con este correo en el Paddock."
        )

    new_user = User(
        id=str(uuid.uuid4()),
        username=clean_username,
        email=clean_email,
        password_hash=hash_password(payload.password),
        racing_credits=500
    )
    db.add(new_user)
    db.flush()

    # Starter Packs
    standard_pack = PackInventory(user_id=new_user.id, pack_type="Standard Crate", quantity=2)
    premium_pack = PackInventory(user_id=new_user.id, pack_type="Premium Crate", quantity=1)
    db.add(standard_pack)
    db.add(premium_pack)

    db.commit()
    db.refresh(new_user)

    return AuthResponse(
        status="success",
        user=UserOut.model_validate(new_user),
        racing_credits=new_user.racing_credits,
        unopened_crates=3,
        message=f"¡Bienvenido al Paddock Oficial, {new_user.username}! Tu Licencia FIA ha sido expedida (+500 CR y 3 Sobres)."
    )


@router.post("/login", response_model=AuthResponse)
def login_driver(payload: UserLoginRequest, db: Session = Depends(get_db)):
    """
    Inicia sesión de Piloto con Email y Contraseña.
    """
    clean_input = payload.email.lower().strip()
    user = db.query(User).filter(
        (User.email == clean_input) | 
        (User.username.ilike(clean_input)) |
        (User.id == clean_input)
    ).first()

    # Convenience aliases for demo pilots
    if not user:
        if clean_input in ["piloto1", "piloto 1", "ayrton"]:
            user = db.query(User).filter(User.id == "pilot-1").first()
        elif clean_input in ["piloto2", "piloto 2", "schumacher", "michael"]:
            user = db.query(User).filter(User.id == "pilot-2").first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales de piloto inválidas. Licencia no encontrada en el Paddock."
        )

    # If demo pilot has no password_hash yet, allow fallback for Ayrton Driver (pilot-1) or verify
    if user.password_hash:
        if not verify_password(payload.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Contraseña de telemetría incorrecta. Acceso denegado a la pista."
            )
    else:
        # Fallback for demo user without hash: set password to whatever was provided
        user.password_hash = hash_password(payload.password)
        db.commit()

    # Calculate unopened crates
    packs = db.query(PackInventory).filter(PackInventory.user_id == user.id).all()
    total_crates = sum(p.quantity for p in packs)

    return AuthResponse(
        status="success",
        user=UserOut.model_validate(user),
        racing_credits=user.racing_credits,
        unopened_crates=total_crates,
        message=f"¡Bienvenido de vuelta a los boxes, {user.username}!"
    )


@router.get("/me", response_model=AuthResponse)
def get_current_driver(user_id: str, db: Session = Depends(get_db)):
    """
    Verifica y devuelve la sesión actual del piloto.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sesión de piloto no encontrada."
        )

    packs = db.query(PackInventory).filter(PackInventory.user_id == user.id).all()
    total_crates = sum(p.quantity for p in packs)

    return AuthResponse(
        status="success",
        user=UserOut.model_validate(user),
        racing_credits=user.racing_credits,
        unopened_crates=total_crates,
        message="Sesión verificada."
    )
