"""
Pydantic schemas for SOS alert events.
"""

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field


class SosCreateRequest(BaseModel):
    type: str = Field(..., min_length=1, max_length=50)
    note: str | None = Field(default=None, max_length=2000)


class SosResponse(BaseModel):
    id: UUID
    society_id: UUID
    raised_by_user_id: UUID
    raised_by_name: str | None = None
    type: str
    note: str | None = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

