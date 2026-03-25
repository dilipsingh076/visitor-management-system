"""
Pydantic schemas for maintenance bills.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import date
from uuid import UUID


class MaintenanceBillCreate(BaseModel):
    flat_id: UUID
    amount: float = Field(..., gt=0)
    due_date: date
    period: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = None


class MaintenanceBillBulkCreate(BaseModel):
    """Create bills for all occupied flats in a building."""
    building_id: UUID
    amount: float = Field(..., gt=0)
    due_date: date
    period: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = None


class MaintenanceBillUpdate(BaseModel):
    amount: Optional[float] = None
    due_date: Optional[date] = None
    period: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None  # pending, paid, overdue
    paid_date: Optional[date] = None
    payment_method: Optional[str] = None
    payment_reference: Optional[str] = None
