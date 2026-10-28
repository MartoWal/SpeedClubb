"""
Database Models for SpeedClub MVP
Integrates:
- users: Drivers profile and racing credits balance
- vehicles_catalog: Master vehicle sticker catalog with rarity tiers (C, B, A, S)
- user_inventory: User vehicle ownership tracking unpasted duplicates and album pasted state
- packs_inventory: Unopened crates/packs for users
- trailer_sessions: Anti-cheat session tracking with timestamps and status (PENDING, COMPLETED, FRAUD)
- trades: Paddock Trade 1-to-1 marketplace offers with statuses (OPEN, MATCHED, CANCELLED)
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class User(Base):
    __tablename__ = 'users'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(50), nullable=False)
    email = Column(String(120), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)
    racing_credits = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    inventory = relationship("UserInventory", back_populates="user", cascade="all, delete-orphan")
    packs = relationship("PackInventory", back_populates="user", cascade="all, delete-orphan")
    trailer_sessions = relationship("TrailerSession", back_populates="user", cascade="all, delete-orphan")
    video_comments = relationship("VideoComment", back_populates="user", cascade="all, delete-orphan")
    trades_offered = relationship("Trade", foreign_keys="Trade.offer_user_id", back_populates="offer_user")


class VehicleCatalog(Base):
    __tablename__ = 'vehicles_catalog'

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    category = Column(String(50), nullable=False)  # Ej: 'Clásicos Urbanos', 'JDM Legends', 'Muscle Cars', 'Supercars'
    rarity_tier = Column(String(10), nullable=False)  # 'C', 'B', 'A', 'S'
    image_url = Column(String(255), nullable=True)

    # Relationships
    inventories = relationship("UserInventory", back_populates="vehicle")
    offered_in_trades = relationship("Trade", foreign_keys="Trade.offer_vehicle_id", back_populates="offer_vehicle")
    requested_in_trades = relationship("Trade", foreign_keys="Trade.request_vehicle_id", back_populates="request_vehicle")


class UserInventory(Base):
    __tablename__ = 'user_inventory'

    user_id = Column(String(36), ForeignKey('users.id'), primary_key=True)
    vehicle_id = Column(Integer, ForeignKey('vehicles_catalog.id'), primary_key=True)
    is_pasted = Column(Boolean, default=False, nullable=False)  # True si ya está en el álbum
    unpasted_count = Column(Integer, default=0, nullable=False)  # Cantidad disponible para pegar o intercambiar

    # Relationships
    user = relationship("User", back_populates="inventory")
    vehicle = relationship("VehicleCatalog", back_populates="inventories")


class PackInventory(Base):
    __tablename__ = 'packs_inventory'

    user_id = Column(String(36), ForeignKey('users.id'), primary_key=True)
    pack_type = Column(String(50), primary_key=True, default="Standard Crate")
    quantity = Column(Integer, default=0, nullable=False)

    # Relationships
    user = relationship("User", back_populates="packs")


class TrailerSession(Base):
    __tablename__ = 'trailer_sessions'

    session_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False, index=True)
    trailer_id = Column(String(50), nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    status = Column(String(20), default="PENDING", nullable=False)  # "PENDING", "COMPLETED", "FRAUD"

    # Relationships
    user = relationship("User", back_populates="trailer_sessions")


class Trade(Base):
    __tablename__ = 'trades'

    trade_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    offer_user_id = Column(String(36), ForeignKey('users.id'), nullable=False, index=True)
    offer_vehicle_id = Column(Integer, ForeignKey('vehicles_catalog.id'), nullable=False)
    request_vehicle_id = Column(Integer, ForeignKey('vehicles_catalog.id'), nullable=False)
    status = Column(String(20), default="OPEN", nullable=False)  # "OPEN", "MATCHED", "CANCELLED"
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    acceptor_user_id = Column(String(36), ForeignKey('users.id'), nullable=True)
    matched_at = Column(DateTime, nullable=True)

    # Relationships
    offer_user = relationship("User", foreign_keys=[offer_user_id], back_populates="trades_offered")
    acceptor_user = relationship("User", foreign_keys=[acceptor_user_id])
    offer_vehicle = relationship("VehicleCatalog", foreign_keys=[offer_vehicle_id], back_populates="offered_in_trades")
    request_vehicle = relationship("VehicleCatalog", foreign_keys=[request_vehicle_id], back_populates="requested_in_trades")


class VideoComment(Base):
    __tablename__ = 'video_comments'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    channel_id = Column(String(50), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False, index=True)
    username = Column(String(100), nullable=False)
    comment = Column(Text, nullable=False)
    likes_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="video_comments")

