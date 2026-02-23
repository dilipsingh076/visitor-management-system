"""Blacklist schemas."""
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime


class BlacklistAddRequest(BaseModel):
    """Request to add visitor to blacklist."""
    visitor_id: UUID
    reason: str = Field(..., min_length=1, max_length=500)


class BlacklistByPhoneRequest(BaseModel):
    """Request to blacklist by phone (creates visitor if not exists)."""
    visitor_phone: str = Field(..., min_length=10, max_length=15)
    visitor_name: str = Field(..., min_length=1, max_length=255)
    reason: str = Field(..., min_length=1, max_length=500)


class BlacklistRemoveRequest(BaseModel):
    """Request to remove visitor from blacklist."""
    visitor_id: UUID


class BlacklistEntry(BaseModel):
    """Blacklist entry response."""
    id: str
    visitor_id: str
    visitor_name: str
    visitor_phone: str
    reason: str
    blacklisted_by: str
    created_at: datetime

    class Config:
        from_attributes = True
