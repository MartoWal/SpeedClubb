from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
from datetime import datetime


# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr


class UserCreate(UserBase):
    pass


class UserRegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(UserBase):
    id: str
    racing_credits: int
    created_at: datetime

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    status: str
    user: UserOut
    racing_credits: int
    unopened_crates: int
    message: str


# Vehicle Schemas
class VehicleOut(BaseModel):
    id: int
    name: str
    category: str
    rarity_tier: str
    image_url: Optional[str] = None
    image: Optional[str] = None

    class Config:
        from_attributes = True


# Inventory Schemas
class InventoryItemOut(BaseModel):
    vehicle_id: int
    name: str
    category: str
    rarity_tier: str
    image_url: Optional[str] = None
    is_pasted: bool
    unpasted_count: int

    class Config:
        from_attributes = True


class PasteVehicleRequest(BaseModel):
    vehicle_id: int


# Crate / Unboxing Schemas
class UnboxResponse(BaseModel):
    status: str
    vehicles_dropped: List[VehicleOut]
    racing_credits: Optional[int] = None
    unopened_crates: Optional[int] = None
    containers: Optional[Dict[str, int]] = None
    message: Optional[str] = None


# Sponsor / Trailer Anti-cheat Schemas
class SponsorChannelOut(BaseModel):
    id: str
    channel_code: str
    title: str
    sponsor_name: str
    sponsor_logo: str
    description: str
    duration_seconds: int
    reward_credits: int
    video_url: str
    thumbnail_url: str
    accent_color: str


class SponsorStatusResponse(BaseModel):
    status: str
    can_watch: bool
    completed_in_window: int
    remaining_in_window: int
    max_videos_per_window: int
    reward_per_video: int
    credits_earned_in_window: int
    max_credits_per_window: int
    cooldown_remaining_seconds: int
    channels: List[SponsorChannelOut]


class StartTrailerSessionRequest(BaseModel):
    trailer_id: str
    duration_seconds: Optional[int] = 20


class StartTrailerSessionResponse(BaseModel):
    session_id: str
    started_at: datetime
    duration_seconds: int
    reward_credits: int


class ClaimTrailerRewardRequest(BaseModel):
    session_id: str


class ClaimTrailerRewardResponse(BaseModel):
    status: str
    credits_awarded: int
    total_credits: int
    completed_in_window: Optional[int] = None
    remaining_in_window: Optional[int] = None
    cooldown_remaining_seconds: Optional[int] = None
    message: Optional[str] = None


class VideoCommentOut(BaseModel):
    id: str
    channel_id: str
    user_id: str
    username: str
    comment: str
    likes_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class AddVideoCommentRequest(BaseModel):
    channel_id: str
    comment: str


class AddVideoCommentResponse(BaseModel):
    status: str
    comment: VideoCommentOut


# Trades Schemas
class CreateTradeRequest(BaseModel):
    offer_vehicle_id: int
    request_vehicle_id: int


class TradeOut(BaseModel):
    trade_id: str
    offer_user_id: str
    offer_vehicle: VehicleOut
    request_vehicle: VehicleOut
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
