"""
Pydantic schemas for complaints.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class ComplaintCreate(BaseModel):
    """Schema for creating a complaint."""
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    category: str = "other"
    priority: str = "medium"


class ComplaintUpdate(BaseModel):
    """Schema for updating a complaint."""
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    assigned_to: Optional[UUID] = None
    resolution_notes: Optional[str] = None


class ComplaintEscalate(BaseModel):
    """Schema for escalating a complaint."""
    escalation_reason: str = Field(..., min_length=1)


class ComplaintCommentCreate(BaseModel):
    """Schema for adding a comment to a complaint."""
    comment: str = Field(..., min_length=1)
    is_internal: bool = False


class ComplaintCommentResponse(BaseModel):
    """Schema for complaint comment response."""
    id: UUID
    complaint_id: UUID
    user_id: Optional[UUID]
    comment: str
    is_internal: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ComplaintResponse(BaseModel):
    """Schema for complaint response."""
    id: UUID
    society_id: UUID
    filed_by: Optional[UUID]
    assigned_to: Optional[UUID]
    title: str
    description: str
    category: str
    priority: str
    status: str
    resolution_notes: Optional[str]
    resolved_at: Optional[datetime]
    resolved_by: Optional[UUID]
    escalated: bool
    escalated_at: Optional[datetime]
    escalation_reason: Optional[str]
    created_at: datetime
    updated_at: datetime
    # Enriched fields (populated by API)
    society_name: Optional[str] = None
    filed_by_name: Optional[str] = None
    assigned_to_name: Optional[str] = None

    class Config:
        from_attributes = True


class ComplaintListResponse(BaseModel):
    """Schema for paginated complaint list."""
    items: List[ComplaintResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class ComplaintStats(BaseModel):
    """Schema for complaint statistics."""
    total: int
    open: int
    in_progress: int
    resolved: int
    escalated: int
    by_category: dict
    by_priority: dict
