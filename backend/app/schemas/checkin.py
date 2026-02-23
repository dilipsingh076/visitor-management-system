"""
Pydantic schemas for check-in/check-out operations.
"""
from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime


class CheckInRequest(BaseModel):
    """Schema for check-in request."""
    visit_id: Optional[UUID] = None
    otp: Optional[str] = Field(None, min_length=6, max_length=6)
    qr_code: Optional[str] = None
    photo_base64: Optional[str] = None  # Base64 encoded photo
    consent_given: bool = Field(..., description="DPDP: Visitor must explicitly consent to data collection")


class CheckOutRequest(BaseModel):
    """Schema for check-out request."""
    visit_id: UUID


class CheckInResponse(BaseModel):
    """Schema for check-in response."""
    visit_id: UUID
    status: str
    checkin_time: datetime
    photo_url: Optional[str] = None
    message: str
