"""
Pydantic schemas for visitor and visit operations.
"""
from pydantic import BaseModel, EmailStr, Field, model_validator
from typing import Optional
from datetime import datetime
from uuid import UUID

from app.models.visitor import VisitStatus


class VisitorCreate(BaseModel):
    """Schema for creating a visitor."""
    phone: str = Field(..., min_length=10, max_length=20)
    email: Optional[EmailStr] = None
    full_name: str = Field(..., min_length=1, max_length=255)
    id_proof_type: Optional[str] = None
    id_proof_number: Optional[str] = None


class VisitorResponse(BaseModel):
    """Schema for visitor response."""
    id: UUID
    phone: str
    email: Optional[str]
    full_name: str
    id_proof_type: Optional[str]
    is_blacklisted: bool
    created_at: datetime

    class Config:
        from_attributes = True


class VisitCreate(BaseModel):
    """Schema for creating a visit (invitation)."""
    visitor_phone: str = Field(..., min_length=10, max_length=20)
    visitor_email: Optional[EmailStr] = None
    visitor_name: str = Field(..., min_length=1, max_length=255)
    purpose: Optional[str] = None
    expected_arrival: Optional[datetime] = None


class WalkInCreate(BaseModel):
    """Schema for guard manual/walk-in registration. Resident identified by host_id OR by building + flat (tower/flat)."""
    visitor_phone: str = Field(..., min_length=10, max_length=20)
    visitor_name: str = Field(..., min_length=1, max_length=255)
    purpose: Optional[str] = None
    host_id: Optional[UUID] = None  # Resident to notify (optional if building_id + flat_number provided)
    building_id: Optional[UUID] = None  # Tower/building – use with flat_number to find resident
    flat_number: Optional[str] = None  # Flat no – use with building_id to find resident

    @model_validator(mode="after")
    def require_host_or_building_flat(self):
        if self.host_id is not None:
            return self
        if self.building_id is not None and self.flat_number and str(self.flat_number).strip():
            return self
        raise ValueError("Provide either host_id or both building_id and flat_number (tower + flat)")


class VisitResponse(BaseModel):
    """Schema for visit response."""
    id: UUID
    visitor_id: UUID
    host_id: UUID
    status: VisitStatus
    purpose: Optional[str]
    expected_arrival: Optional[datetime]
    actual_arrival: Optional[datetime]
    actual_departure: Optional[datetime]
    qr_code: Optional[str]
    otp: Optional[str]
    consent_given: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
