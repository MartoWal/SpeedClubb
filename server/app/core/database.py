"""
Database session management for SpeedClub Backend.
Uses SQLite with WAL mode and foreign key enforcement.
"""

import os
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.engine import Engine
from app.models.models import Base

DB_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "database"))
os.makedirs(DB_DIR, exist_ok=True)
SQLITE_DB_PATH = os.path.join(DB_DIR, "speedclub.db")
DATABASE_URL = f"sqlite:///{SQLITE_DB_PATH}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False
)


# SQLite PRAGMAs for concurrency & data integrity
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.close()


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
