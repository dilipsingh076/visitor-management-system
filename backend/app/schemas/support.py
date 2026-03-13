"""
Pydantic schemas for support tickets.
"""
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class SupportTicketCreate(BaseModel):
    """Schema for creating a support ticket."""
    subject: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    category: str = "other"
    priority: str = "medium"
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None


class SupportTicketUpdate(BaseModel):
    """Schema for updating a support ticket."""
    subject: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    assigned_to: Optional[UUID] = None
    resolution_notes: Optional[str] = None


class TicketMessageCreate(BaseModel):
    """Schema for adding a message to a ticket."""
    message: str = Field(..., min_length=1)
    attachments: Optional[str] = None  # JSON array of file URLs


class TicketMessageResponse(BaseModel):
    """Schema for ticket message response."""
    id: UUID
    ticket_id: UUID
    user_id: Optional[UUID]
    message: str
    is_staff_reply: bool
    attachments: Optional[str]
    created_at: datetime
    # Enriched fields
    user_name: Optional[str] = None

    class Config:
        from_attributes = True


class SupportTicketResponse(BaseModel):
    """Schema for support ticket response."""
    id: UUID
    ticket_number: str
    society_id: Optional[UUID]
    user_id: Optional[UUID]
    assigned_to: Optional[UUID]
    subject: str
    description: str
    category: str
    priority: str
    status: str
    resolved_at: Optional[datetime]
    resolved_by: Optional[UUID]
    resolution_notes: Optional[str]
    contact_email: Optional[str]
    contact_phone: Optional[str]
    created_at: datetime
    updated_at: datetime
    # Enriched fields
    society_name: Optional[str] = None
    user_name: Optional[str] = None
    assigned_to_name: Optional[str] = None
    messages: List[TicketMessageResponse] = []

    class Config:
        from_attributes = True


class SupportTicketListResponse(BaseModel):
    """Schema for paginated ticket list."""
    items: List[SupportTicketResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class SupportStats(BaseModel):
    """Schema for support statistics."""
    total: int
    open: int
    in_progress: int
    resolved: int
    by_category: dict
    by_priority: dict
    avg_resolution_time_hours: Optional[float]
