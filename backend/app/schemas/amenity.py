"""Pydantic schemas for society amenities."""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class AmenityCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    code: Optional[str] = None
    description: Optional[str] = None
    status: str = "operational"
    sort_order: int = 0


class AmenityUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class AmenityResponse(BaseModel):
    id: UUID
    society_id: UUID
    name: str
    code: Optional[str]
    description: Optional[str]
    status: str
    sort_order: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
