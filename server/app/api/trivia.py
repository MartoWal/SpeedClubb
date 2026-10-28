"""
FIA SpeedClub Knowledge - Trivia Diaria de Paddock
Sistema de Desafío Diario con Preguntas Aleatorias Multitemática:
- 5 preguntas aleatorias seleccionadas de temáticas oficiales diferentes.
- Temporizador regresivo de 20 segundos por pregunta.
- Escala de recompensa oficial:
    5 aciertos -> +300 CR (Gran Premio)
    4 aciertos -> +200 CR
    3 aciertos -> +120 CR
    2 aciertos -> +70 CR
    1 acierto  -> +30 CR
    0 aciertos -> +10 CR (Bono consolación)
- Reinicio diario a las 23:59:59 sincronizado con cuota de permutas.
"""

import os
import json
import random
from datetime import datetime, timedelta, time
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import User, DailyTriviaSession

router = APIRouter(prefix="/api/trivia", tags=["FIA SpeedClub Trivia"])

# Load trivia questions bank
QUESTIONS_FILE = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "data", "trivia_questions.json")
)

TRIVIA_BANK: List[Dict[str, Any]] = []
if os.path.exists(QUESTIONS_FILE):
    with open(QUESTIONS_FILE, "r", encoding="utf-8") as f:
        TRIVIA_BANK = json.load(f)
else:
    print(f"Warning: Trivia bank file not found at {QUESTIONS_FILE}")

# Map question ID for fast O(1) lookup during submission
QUESTIONS_BY_ID = {q["id"]: q for q in TRIVIA_BANK}

REWARD_SCALE = {
    5: 300,
    4: 200,
    3: 120,
    2: 70,
    1: 30,
    0: 10
}


def get_current_day_bounds():
    """
    Returns today's date string 'YYYY-MM-DD' and seconds remaining until 23:59:59 tonight.
    """
    now = datetime.now()
    today_str = now.strftime("%Y-%m-%d")
    tomorrow_start = datetime.combine(now.date() + timedelta(days=1), time(0, 0, 0))
    seconds_to_midnight = max(0, int((tomorrow_start - now).total_seconds()))
    return today_str, seconds_to_midnight


# Schemas
class QuestionOptionOut(BaseModel):
    id: str
    category: str
    difficulty: str
    question: str
    options: List[str]


class DailyTriviaStatusResponse(BaseModel):
    played: bool
    session_date: str
    seconds_to_midnight: int
    time_limit_seconds: int = 20
    score: Optional[int] = None
    credits_awarded: Optional[int] = None
    completed_at: Optional[str] = None
    questions: Optional[List[QuestionOptionOut]] = None


class UserAnswerInput(BaseModel):
    question_id: str
    selected_index: int  # -1 if timed out without selection


class SubmitTriviaRequest(BaseModel):
    user_id: str
    answers: List[UserAnswerInput]


class QuestionReviewOut(BaseModel):
    id: str
    category: str
    question: str
    options: List[str]
    selected_index: int
    correct_index: int
    is_correct: bool
    lore: str


class SubmitTriviaResponse(BaseModel):
    success: bool
    session_date: str
    score: int
    total_questions: int
    credits_awarded: int
    new_balance: int
    breakdown: List[QuestionReviewOut]
    seconds_to_midnight: int
    message: str


@router.get("/today", response_model=DailyTriviaStatusResponse)
def get_daily_trivia(
    user_id: str = Query("pilot-1", description="ID del piloto"),
    db: Session = Depends(get_db)
):
    """
    Verifica si el usuario ya completó la trivia del día o genera 5 preguntas aleatorias.
    """
    today_str, seconds_to_midnight = get_current_day_bounds()

    # Check if user already played today
    session = db.query(DailyTriviaSession).filter_by(
        user_id=user_id,
        session_date=today_str
    ).first()

    if session:
        return DailyTriviaStatusResponse(
            played=True,
            session_date=today_str,
            seconds_to_midnight=seconds_to_midnight,
            time_limit_seconds=20,
            score=session.score,
            credits_awarded=session.credits_awarded,
            completed_at=session.completed_at.isoformat() if session.completed_at else None,
            questions=None
        )

    # User hasn't played today: pick 5 random questions across 5 distinct themes
    # 1. Group questions by category
    categories_map: Dict[str, List[Dict[str, Any]]] = {}
    for q in TRIVIA_BANK:
        cat = q["category"]
        if cat not in categories_map:
            categories_map[cat] = []
        categories_map[cat].append(q)

    # 2. Select 5 distinct categories
    all_categories = list(categories_map.keys())
    selected_categories = random.sample(all_categories, min(5, len(all_categories)))

    # 3. From each selected category, pick 1 random question
    selected_questions: List[QuestionOptionOut] = []
    for cat in selected_categories:
        q = random.choice(categories_map[cat])
        selected_questions.append(
            QuestionOptionOut(
                id=q["id"],
                category=q["category"],
                difficulty=q["difficulty"],
                question=q["question"],
                options=q["options"]
            )
        )

    return DailyTriviaStatusResponse(
        played=False,
        session_date=today_str,
        seconds_to_midnight=seconds_to_midnight,
        time_limit_seconds=20,
        questions=selected_questions
    )


@router.post("/submit", response_model=SubmitTriviaResponse)
def submit_daily_trivia(
    payload: SubmitTriviaRequest,
    db: Session = Depends(get_db)
):
    """
    Califica la trivia diaria, acredita los Créditos de Carrera correspondientes
    y guarda la sesión en SQLite para impedir repetición hasta las 23:59:59.
    """
    today_str, seconds_to_midnight = get_current_day_bounds()

    # Verify user exists
    user = db.query(User).filter_by(id=payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Piloto no encontrado.")

    # Check if already played today
    existing_session = db.query(DailyTriviaSession).filter_by(
        user_id=payload.user_id,
        session_date=today_str
    ).first()

    if existing_session:
        raise HTTPException(
            status_code=400,
            detail="Ya has completado tu desafío de trivia de hoy. Vuelve mañana para un nuevo desafío."
        )

    # Evaluate answers
    score = 0
    breakdown: List[QuestionReviewOut] = []

    for item in payload.answers:
        q_ref = QUESTIONS_BY_ID.get(item.question_id)
        if not q_ref:
            continue

        is_correct = (item.selected_index == q_ref["correct_index"])
        if is_correct:
            score += 1

        breakdown.append(
            QuestionReviewOut(
                id=q_ref["id"],
                category=q_ref["category"],
                question=q_ref["question"],
                options=q_ref["options"],
                selected_index=item.selected_index,
                correct_index=q_ref["correct_index"],
                is_correct=is_correct,
                lore=q_ref.get("lore", "")
            )
        )

    credits_awarded = REWARD_SCALE.get(score, 10)

    # Update atomic balance
    user.racing_credits += credits_awarded

    # Record completed session
    trivia_session = DailyTriviaSession(
        user_id=user.id,
        session_date=today_str,
        score=score,
        credits_awarded=credits_awarded,
        completed_at=datetime.utcnow()
    )
    db.add(trivia_session)
    db.commit()
    db.refresh(user)

    message = f"¡Desafío completado! Has acertado {score} de {len(breakdown)} preguntas. Se han acreditado +{credits_awarded} CR a tu cuenta."

    return SubmitTriviaResponse(
        success=True,
        session_date=today_str,
        score=score,
        total_questions=len(breakdown),
        credits_awarded=credits_awarded,
        new_balance=user.racing_credits,
        breakdown=breakdown,
        seconds_to_midnight=seconds_to_midnight,
        message=message
    )
