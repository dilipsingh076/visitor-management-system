"""
Pydantic schemas for platform admin features.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime
from uuid import UUID
from decimal import Decimal


# ============== Platform Dashboard ==============

class PlatformDashboardStats(BaseModel):
    """Schema for platform dashboard statistics."""
    total_societies: int
    active_societies: int
    total_residents: int
    total_visitors_today: int
    total_visitors_month: int
    total_complaints: int
    open_complaints: int
    total_support_tickets: int
    open_support_tickets: int
    total_revenue: Decimal
    revenue_this_month: Decimal
    active_subscriptions: int


class SocietyGrowthData(BaseModel):
    """Schema for society growth chart data."""
    date: str
    count: int


class RevenueData(BaseModel):
    """Schema for revenue chart data."""
    date: str
    amount: Decimal


class ActivityFeedItem(BaseModel):
    """Schema for activity feed item."""
    id: UUID
    activity_type: str
    description: str
    user_name: Optional[str]
    society_name: Optional[str]
    created_at: datetime


class PlatformDashboardResponse(BaseModel):
    """Schema for complete platform dashboard response."""
    stats: PlatformDashboardStats
    society_growth: List[SocietyGrowthData]
    revenue_trend: List[RevenueData]
    recent_activity: List[ActivityFeedItem]
    top_societies: List[dict]
    complaint_breakdown: dict


# ============== Announcements ==============

class AnnouncementCreate(BaseModel):
    """Schema for creating a platform announcement."""
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)
    type: str = "info"  # info, warning, maintenance, feature, urgent
    target_audience: str = "all"  # all, admins, residents, guards
    target_society_id: Optional[UUID] = None
    show_from: Optional[datetime] = None
    show_until: Optional[datetime] = None
    is_active: bool = True


class AnnouncementUpdate(BaseModel):
    """Schema for updating an announcement."""
    title: Optional[str] = None
    content: Optional[str] = None
    type: Optional[str] = None
    target_audience: Optional[str] = None
    target_society_id: Optional[UUID] = None
    show_from: Optional[datetime] = None
    show_until: Optional[datetime] = None
    is_active: Optional[bool] = None


class AnnouncementResponse(BaseModel):
    """Schema for announcement response."""
    id: UUID
    title: str
    content: str
    type: str
    target_audience: str
    target_society_id: Optional[UUID]
    is_active: bool
    show_from: Optional[datetime]
    show_until: Optional[datetime]
    created_by: Optional[UUID]
    created_at: datetime
    updated_at: datetime
    target_society_name: Optional[str] = None

    class Config:
        from_attributes = True


# ============== System Settings ==============

class SystemSettingUpdate(BaseModel):
    """Schema for updating a system setting."""
    value: str
    description: Optional[str] = None


class SystemSettingResponse(BaseModel):
    """Schema for system setting response."""
    id: UUID
    key: str
    value: Optional[str]
    value_type: str
    category: Optional[str]
    description: Optional[str]
    is_public: bool
    updated_at: datetime

    class Config:
        from_attributes = True


class SystemSettingBulkUpdate(BaseModel):
    """Schema for bulk updating system settings."""
    settings: List[dict]  # [{key: str, value: str}, ...]


# ============== Audit Logs ==============

class AuditLogResponse(BaseModel):
    """Schema for audit log response."""
    id: UUID
    user_id: UUID
    action: str
    endpoint: str
    request_method: Optional[str]
    details: Optional[dict]
    created_at: datetime
    user_name: Optional[str] = None
    user_email: Optional[str] = None

    class Config:
        from_attributes = True


class AuditLogListResponse(BaseModel):
    """Schema for paginated audit log list."""
    items: List[AuditLogResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# ============== Activity Logs ==============

class ActivityLogResponse(BaseModel):
    """Schema for activity log response."""
    id: UUID
    user_id: Optional[UUID]
    society_id: Optional[UUID]
    activity_type: str
    description: Optional[str]
    entity_type: Optional[str]
    entity_id: Optional[UUID]
    ip_address: Optional[str]
    created_at: datetime
    user_name: Optional[str] = None
    society_name: Optional[str] = None

    class Config:
        from_attributes = True


# ============== Global User Management ==============

class GlobalUserResponse(BaseModel):
    """Schema for global user response (platform admin view)."""
    id: UUID
    email: str
    phone: Optional[str]
    full_name: str
    flat_number: Optional[str]
    is_active: bool
    is_verified: bool
    role: str
    roles: Optional[List[str]]
    society_id: Optional[UUID]
    building_id: Optional[UUID]
    last_login: Optional[datetime]
    created_at: datetime
    society_name: Optional[str] = None
    building_name: Optional[str] = None

    class Config:
        from_attributes = True


class GlobalUserListResponse(BaseModel):
    """Schema for paginated global user list."""
    items: List[GlobalUserResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class GlobalUserUpdate(BaseModel):
    """Schema for updating a user (platform admin)."""
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    role: Optional[str] = None
    roles: Optional[List[str]] = None


class ResetPasswordRequest(BaseModel):
    """Schema for resetting a user's password."""
    new_password: str = Field(..., min_length=8)


# ============== Society Management ==============

class SocietyDetailResponse(BaseModel):
    """Schema for detailed society response."""
    id: UUID
    name: str
    slug: str
    address: Optional[str]
    city: Optional[str]
    state: Optional[str]
    pincode: Optional[str]
    country: Optional[str]
    contact_email: str
    contact_phone: Optional[str]
    registration_number: Optional[str]
    society_type: Optional[str]
    plan: Optional[str]
    status: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    # Computed stats
    total_buildings: int = 0
    total_residents: int = 0
    total_visitors_today: int = 0
    total_visitors_month: int = 0

    class Config:
        from_attributes = True


class SocietyUpdate(BaseModel):
    """Schema for updating a society."""
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    plan: Optional[str] = None
    status: Optional[str] = None
    is_active: Optional[bool] = None


class AssignAdminRequest(BaseModel):
    """Schema for assigning admin to a society."""
    user_id: Optional[UUID] = None  # Existing user
    email: Optional[str] = None  # New user email
    full_name: Optional[str] = None  # New user name
    phone: Optional[str] = None
    role: str = "chairman"  # chairman, secretary, treasurer


class SocietyListResponse(BaseModel):
    """Schema for paginated society list."""
    items: List[SocietyDetailResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
