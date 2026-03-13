"""Pydantic schemas for society maintenance staff."""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class MaintenanceStaffCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    role: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = None
    email: Optional[str] = None
    building_id: Optional[UUID] = None
    notes: Optional[str] = None


class MaintenanceStaffUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    building_id: Optional[UUID] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class MaintenanceStaffResponse(BaseModel):
    id: UUID
    society_id: UUID
    full_name: str
    role: str
    phone: Optional[str]
    email: Optional[str]
    building_id: Optional[UUID]
    building_name: Optional[str] = None
    notes: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
