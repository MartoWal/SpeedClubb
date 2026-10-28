"""
Economy & Sponsors API Endpoints
Implements SpeedClub TV Sponsor Broadcasting Hub with Anti-Cheat & 2-Hour Window Quota:
1. GET /api/sponsors/status: Returns quota (3 videos max / 2h), cooldown timer, and sponsor channels.
2. POST /api/sponsors/start-session: Registers viewing session with server timestamp (checks 2h quota).
3. POST /api/sponsors/claim: Validates real elapsed time on server and awards 100 CR atomically into SQLite.
"""

from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import User, TrailerSession, VideoComment
from app.schemas.schemas import (
    StartTrailerSessionRequest, StartTrailerSessionResponse,
    ClaimTrailerRewardRequest, ClaimTrailerRewardResponse,
    SponsorChannelOut, SponsorStatusResponse,
    VideoCommentOut, AddVideoCommentRequest, AddVideoCommentResponse
)

router = APIRouter(prefix="/api/sponsors", tags=["SpeedClub TV & Sponsors"])

# Quota & Economy Parameters
REWARD_CREDITS_PER_VIDEO = 100
MAX_VIDEOS_PER_WINDOW = 3
WINDOW_SECONDS = 2 * 3600  # 2 hours (7200 seconds)
MIN_WATCH_SECONDS = 20      # Minimum watch duration before claiming
NETWORK_TOLERANCE_SECONDS = 2

# Curated Official Sponsor Channels
SPONSOR_CHANNELS: List[dict] = [
    {
        "id": "ch-ferrari",
        "channel_code": "CH-01",
        "title": "Scuderia Ferrari // 499P Le Mans & F1 High Speed Attack",
        "sponsor_name": "SCUDERIA FERRARI",
        "sponsor_logo": "🐎 FERRARI",
        "description": "Sonido puro de competición, aceleración brutal en recta y telemetría oficial de Scuderia Ferrari.",
        "duration_seconds": 16,
        "reward_credits": REWARD_CREDITS_PER_VIDEO,
        "video_url": "/assets/videos/Ferrari.mp4",
        "thumbnail_url": "/assets/backgrounds/Fondos-ferrari/fondo-ferrari-formula1.webp",
        "accent_color": "#dc2626"
    },
    {
        "id": "ch-porsche",
        "channel_code": "CH-02",
        "title": "Porsche Motorsport // 911 GT3 RS & 963 LMDh",
        "sponsor_name": "PORSCHE MOTORSPORT",
        "sponsor_logo": "🛡️ PORSCHE",
        "description": "Vuelta récord onboard en Nürburgring Nordschleife y desarrollo en pista del 963 LMDh de las 24h de Le Mans.",
        "duration_seconds": 15,
        "reward_credits": REWARD_CREDITS_PER_VIDEO,
        "video_url": "/assets/videos/Porsche.mp4",
        "thumbnail_url": "/assets/backgrounds/Fondos-Porsche-Team/Fondo-Porsche-Team-Oficial.jfif",
        "accent_color": "#2563eb"
    },
    {
        "id": "ch-wrc",
        "channel_code": "CH-03",
        "title": "FIA WRC Championship // Tramos Alpinos & Gravilla",
        "sponsor_name": "WRC WORLD RALLY",
        "sponsor_logo": "🏁 WRC",
        "description": "Derrapes a 180 km/h al borde del precipicio en el Rallye Monte-Carlo con Subaru Impreza y Toyota Yaris Rally1.",
        "duration_seconds": 18,
        "reward_credits": REWARD_CREDITS_PER_VIDEO,
        "video_url": "/assets/videos/WRC.mp4",
        "thumbnail_url": "/assets/backgrounds/Fondos-WRC/fondo-WRC-cars.jpg",
        "accent_color": "#2563eb"
    },
    {
        "id": "ch-jdm",
        "channel_code": "CH-04",
        "title": "Gran Turismo JDM Touge // Batalla en Mount Akina",
        "sponsor_name": "INITIAL D / SPOON",
        "sponsor_logo": "⚡ TOUGE",
        "description": "Duelo legendario entre el Sprinter Trueno AE86 y el RX-7 FD3S al límite de revoluciones en bajada de montaña.",
        "duration_seconds": 17,
        "reward_credits": REWARD_CREDITS_PER_VIDEO,
        "video_url": "/assets/videos/JDM.mp4",
        "thumbnail_url": "/assets/backgrounds/fondos-INITIAL-D/Fondo-Initial-D-Supra-RX7.jpg",
        "accent_color": "#dc2626"
    }
]


def _get_user_window_info(user_id: str, db: Session):
    """
    Calcula cuántos videos ha visto el usuario en la ventana activa de 2 horas
    y el tiempo restante de cooldown si ha alcanzado el límite de 3 transmisiones.
    """
    window_start = datetime.utcnow() - timedelta(seconds=WINDOW_SECONDS)
    
    # Buscar sesiones completadas en las últimas 2 horas
    completed_sessions = (
        db.query(TrailerSession)
        .filter(
            TrailerSession.user_id == user_id,
            TrailerSession.status == "COMPLETED",
            TrailerSession.started_at >= window_start
        )
        .order_by(TrailerSession.started_at.asc())
        .all()
    )

    completed_count = len(completed_sessions)
    credits_earned = completed_count * REWARD_CREDITS_PER_VIDEO

    if completed_count >= MAX_VIDEOS_PER_WINDOW:
        # La tanda de 3 fue completada. Cooldown de 2 horas desde el ÚLTIMO video visto.
        last_session = completed_sessions[-1]
        reactivate_at = last_session.started_at + timedelta(seconds=WINDOW_SECONDS)
        now = datetime.utcnow()
        remaining_seconds = max(0, int((reactivate_at - now).total_seconds()))

        if remaining_seconds > 0:
            return {
                "can_watch": False,
                "completed_in_window": completed_count,
                "remaining_in_window": 0,
                "credits_earned_in_window": credits_earned,
                "cooldown_remaining_seconds": remaining_seconds
            }

    # Usuario aún puede ver transmisiones
    remaining_watches = max(0, MAX_VIDEOS_PER_WINDOW - completed_count)
    return {
        "can_watch": True,
        "completed_in_window": completed_count,
        "remaining_in_window": remaining_watches,
        "credits_earned_in_window": credits_earned,
        "cooldown_remaining_seconds": 0
    }


@router.get("/status", response_model=SponsorStatusResponse)
def get_sponsor_status(user_id: str = "pilot-1", db: Session = Depends(get_db)):
    """
    Retorna el estado de cuota y disponibilidad de SpeedClub TV para el usuario:
    - can_watch: Si puede reproducir transmisiones y ganar créditos
    - completed_in_window: 0, 1, 2 o 3
    - remaining_in_window: 3, 2, 1 o 0
    - cooldown_remaining_seconds: Segundos restantes de la ventana de 2 horas
    - channels: Canales oficiales disponibles para sintonizar
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        # Fallback para usuario piloto nuevo
        user = User(id=user_id, username=f"Piloto {user_id}", email=f"{user_id}@speedclub.io", racing_credits=500)
        db.add(user)
        db.commit()

    info = _get_user_window_info(user_id, db)
    channels_out = [SponsorChannelOut(**ch) for ch in SPONSOR_CHANNELS]

    return SponsorStatusResponse(
        status="success",
        can_watch=info["can_watch"],
        completed_in_window=info["completed_in_window"],
        remaining_in_window=info["remaining_in_window"],
        max_videos_per_window=MAX_VIDEOS_PER_WINDOW,
        reward_per_video=REWARD_CREDITS_PER_VIDEO,
        credits_earned_in_window=info["credits_earned_in_window"],
        max_credits_per_window=MAX_VIDEOS_PER_WINDOW * REWARD_CREDITS_PER_VIDEO,
        cooldown_remaining_seconds=info["cooldown_remaining_seconds"],
        channels=channels_out
    )


@router.post("/start-session", response_model=StartTrailerSessionResponse)
def start_trailer_session(
    payload: StartTrailerSessionRequest,
    user_id: str = "pilot-1",
    db: Session = Depends(get_db)
):
    """
    Inicia una sesión de visualización de tráiler.
    Verifica que el usuario no haya excedido el cupo de 3 transmisiones en la ventana de 2 horas.
    Anota started_at con la hora oficial del servidor.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = User(id=user_id, username=f"Piloto {user_id}", email=f"{user_id}@speedclub.io", racing_credits=500)
        db.add(user)
        db.commit()

    info = _get_user_window_info(user_id, db)
    if not info["can_watch"]:
        mins = info["cooldown_remaining_seconds"] // 60
        secs = info["cooldown_remaining_seconds"] % 60
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Has completado el cupo de 3 transmisiones (300 CR obtenidos). Próximo repostaje de TV disponible en {mins:02d}m {secs:02d}s."
        )

    session = TrailerSession(
        user_id=user_id,
        trailer_id=payload.trailer_id,
        started_at=datetime.utcnow(),
        status="PENDING"
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    channel_spec = next((ch for ch in SPONSOR_CHANNELS if ch["id"] == payload.trailer_id), None)
    duration_sec = channel_spec["duration_seconds"] if channel_spec else MIN_WATCH_SECONDS

    return StartTrailerSessionResponse(
        session_id=session.session_id,
        started_at=session.started_at,
        duration_seconds=duration_sec,
        reward_credits=REWARD_CREDITS_PER_VIDEO
    )


@router.post("/claim", response_model=ClaimTrailerRewardResponse)
def claim_trailer_reward(
    payload: ClaimTrailerRewardRequest,
    db: Session = Depends(get_db)
):
    """
    Valida la duración real transcurrida contra la hora del servidor.
    Si pasaron menos de los segundos mínimos requeridos (con margen de tolerancia), marca FRAUD (403).
    Acredita de forma atómica 100 CR al usuario en SQLite y actualiza el contador.
    """
    session = db.query(TrailerSession).filter(TrailerSession.session_id == payload.session_id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sesión de telemetría no encontrada.")

    if session.status == "COMPLETED":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Recompensa ya reclamada para esta sesión.")

    if session.status == "FRAUD":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sesión invalidada por detección de telemetría fraudulenta.")

    now = datetime.utcnow()
    elapsed_seconds = (now - session.started_at).total_seconds()
    
    # Calcular duración esperada según el canal de la transmisión
    channel_spec = next((ch for ch in SPONSOR_CHANNELS if ch["id"] == session.trailer_id), None)
    channel_duration = channel_spec["duration_seconds"] if channel_spec else MIN_WATCH_SECONDS
    min_required_seconds = max(10, channel_duration - NETWORK_TOLERANCE_SECONDS)

    if elapsed_seconds < min_required_seconds:
        session.status = "FRAUD"
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Detección de fraude: Tiempo transcurrido ({elapsed_seconds:.1f}s) inferior al mínimo requerido ({channel_duration}s)."
        )

    # Validar cuota de la ventana de 2 horas
    info = _get_user_window_info(session.user_id, db)
    if info["completed_in_window"] >= MAX_VIDEOS_PER_WINDOW:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Cupo máximo de 3 transmisiones en 2 horas alcanzado (300 CR obtenidos)."
        )

    # Sesión válida: sumamos 100 créditos de forma atómica
    user = db.query(User).filter(User.id == session.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado.")

    user.racing_credits += REWARD_CREDITS_PER_VIDEO
    session.status = "COMPLETED"
    db.commit()
    db.refresh(user)

    # Recalcular nuevo estado tras completar esta sesión
    updated_info = _get_user_window_info(session.user_id, db)

    return ClaimTrailerRewardResponse(
        status="COMPLETED",
        credits_awarded=REWARD_CREDITS_PER_VIDEO,
        total_credits=user.racing_credits,
        completed_in_window=updated_info["completed_in_window"],
        remaining_in_window=updated_info["remaining_in_window"],
        cooldown_remaining_seconds=updated_info["cooldown_remaining_seconds"],
        message="¡Felicidades, ganaste 100 créditos!"
    )


# ==========================================
# Video Forum & Pilot Community Live Stream
# ==========================================

DEFAULT_CHANNEL_COMMENTS = {
    "ch-porsche": [
        {"username": "Ayrton Driver", "comment": "El paso por Schwedenkreuz a 270 km/h con esa aerodinámica activa es impresionante 🔥", "likes_count": 18, "offset_mins": 35},
        {"username": "Walter R.", "comment": "Configuración de amortiguadores perfecta para los pianos del Nordschleife. Tiempo de vuelta histórico.", "likes_count": 12, "offset_mins": 80},
        {"username": "Stig Paddock", "comment": "Ese motor bóxer 4.0L aspirado a 9.000 RPM nunca defrauda.", "likes_count": 9, "offset_mins": 140}
    ],
    "ch-ferrari": [
        {"username": "Charles L.", "comment": "El sonido del V6 híbrido en plena recta es arte puro. Cero pérdida de tracción.", "likes_count": 24, "offset_mins": 20},
        {"username": "Enzo Corse", "comment": "Telemetría de frenos carbocerámicos impecable en la frenada de Variante del Rettifilo.", "likes_count": 15, "offset_mins": 65},
        {"username": "Maranello Fan", "comment": "Ganadores legítimos de las 24h de Le Mans. Orgullo total.", "likes_count": 8, "offset_mins": 120}
    ],
    "ch-wrc": [
        {"username": "Carlos S.", "comment": "Ese salto a 170 km/h en el tramo de Ouninpohja exige nervios de acero 🌲💨", "likes_count": 31, "offset_mins": 15},
        {"username": "Sébastien O.", "comment": "El diferencial electrónico trabajando en el hielo sueco es una maravilla de ingeniería.", "likes_count": 19, "offset_mins": 50},
        {"username": "Rally Fanatic", "comment": "¡El Yaris Rally1 no toca el piso en 40 metros de vuelo!", "likes_count": 11, "offset_mins": 110}
    ],
    "ch-jdm": [
        {"username": "Takumi F.", "comment": "La transferencia de pesos en las curvas cerradas del monte Akina... pura poesía mecánica.", "likes_count": 42, "offset_mins": 10},
        {"username": "Keisuke T.", "comment": "El RB26DETT soplando a 1.8 bar en el túnel de C1 de noche no tiene rival.", "likes_count": 27, "offset_mins": 45},
        {"username": "SpeedStars Club", "comment": "¡Inolvidable sonido de la válvula de alivio!", "likes_count": 14, "offset_mins": 90}
    ]
}


@router.get("/comments", response_model=List[VideoCommentOut])
def get_video_comments(channel_id: str, db: Session = Depends(get_db)):
    """
    Retorna los comentarios del foro de telemetría para el canal especificado.
    Si la base de datos no tiene comentarios aún, inicializa los comentarios base de pilotos de competición.
    """
    comments = (
        db.query(VideoComment)
        .filter(VideoComment.channel_id == channel_id)
        .order_by(VideoComment.created_at.desc())
        .all()
    )

    if not comments and channel_id in DEFAULT_CHANNEL_COMMENTS:
        system_user = db.query(User).filter(User.id == "pilot-1").first()
        if not system_user:
            system_user = User(id="pilot-1", username="Ayrton Driver", email="ayrton@speedclub.io", racing_credits=500)
            db.add(system_user)
            db.commit()

        for c_data in DEFAULT_CHANNEL_COMMENTS[channel_id]:
            c_time = datetime.utcnow() - timedelta(minutes=c_data["offset_mins"])
            comment_obj = VideoComment(
                channel_id=channel_id,
                user_id=system_user.id,
                username=c_data["username"],
                comment=c_data["comment"],
                likes_count=c_data["likes_count"],
                created_at=c_time
            )
            db.add(comment_obj)
        db.commit()

        comments = (
            db.query(VideoComment)
            .filter(VideoComment.channel_id == channel_id)
            .order_by(VideoComment.created_at.desc())
            .all()
        )

    return comments


@router.post("/comments", response_model=AddVideoCommentResponse)
def add_video_comment(
    payload: AddVideoCommentRequest,
    user_id: str = "pilot-1",
    db: Session = Depends(get_db)
):
    """
    Permite a un piloto publicar un comentario o reacción en el foro de la transmisión activa.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = User(id=user_id, username="Ayrton Driver", email=f"{user_id}@speedclub.io", racing_credits=500)
        db.add(user)
        db.commit()

    clean_comment = payload.comment.strip()
    if not clean_comment:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El comentario no puede estar vacío.")

    new_comment = VideoComment(
        channel_id=payload.channel_id,
        user_id=user.id,
        username=user.username,
        comment=clean_comment,
        likes_count=1,
        created_at=datetime.utcnow()
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return AddVideoCommentResponse(
        status="success",
        comment=new_comment
    )


@router.post("/comments/{comment_id}/like")
def like_video_comment(comment_id: str, db: Session = Depends(get_db)):
    """
    Incrementa el contador de reacciones (likes) a un comentario del foro.
    """
    comment = db.query(VideoComment).filter(VideoComment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comentario no encontrado.")

    comment.likes_count += 1
    db.commit()
    return {"status": "success", "likes_count": comment.likes_count}

