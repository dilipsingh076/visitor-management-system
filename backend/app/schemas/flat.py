"""
Pydantic schemas for flat and flat member operations.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime
from uuid import UUID


class FlatCreate(BaseModel):
    building_id: UUID
    flat_number: str = Field(..., min_length=1, max_length=50)
    floor: Optional[int] = None
    flat_type: Optional[str] = Field(None, max_length=50)
    owner_name: Optional[str] = Field(None, max_length=255)


class FlatBulkCreate(BaseModel):
    building_id: UUID
    total_floors: int = Field(..., ge=1, le=100)
    units_per_floor: int = Field(..., ge=1, le=50)
    start_floor: int = Field(1, ge=-5)
    flat_type: Optional[str] = Field(None, max_length=50)


class FlatUpdate(BaseModel):
    flat_number: Optional[str] = Field(None, min_length=1, max_length=50)
    floor: Optional[int] = None
    flat_type: Optional[str] = Field(None, max_length=50)
    occupancy_status: Optional[str] = Field(None, pattern="^(vacant|occupied)$")
    owner_name: Optional[str] = Field(None, max_length=255)
    is_active: Optional[bool] = None


class FlatMemberCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    relation: str = Field(..., pattern="^(spouse|parent|child|sibling|other)$")
    date_of_birth: Optional[date] = None
    id_proof_type: Optional[str] = Field(None, max_length=50)
    id_proof_number: Optional[str] = Field(None, max_length=255)


class FlatMemberUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    relation: Optional[str] = Field(None, pattern="^(spouse|parent|child|sibling|other)$")
    date_of_birth: Optional[date] = None
    id_proof_type: Optional[str] = Field(None, max_length=50)
    id_proof_number: Optional[str] = Field(None, max_length=255)
