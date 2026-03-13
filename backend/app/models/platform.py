"""
Platform-level models for notifications and settings.
"""
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from datetime import datetime
import uuid
import enum

from app.core.database import Base
from app.core.db_types import GUID


class AnnouncementType(str, enum.Enum):
    INFO = "info"
    WARNING = "warning"
    MAINTENANCE = "maintenance"
    FEATURE = "feature"
    URGENT = "urgent"


class PlatformAnnouncement(Base):
    """
    Platform-wide announcements visible to all users or specific societies.
    """
    __tablename__ = "platform_announcements"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    type = Column(String(20), nullable=False, default=AnnouncementType.INFO.value)
    target_audience = Column(String(50), nullable=True, default="all")  # all, admins, residents, guards
    target_society_id = Column(GUID(), ForeignKey("societies.id", ondelete="CASCADE"), nullable=True, index=True)
    
    is_active = Column(Boolean, default=True, nullable=False)
    show_from = Column(DateTime, nullable=True)
    show_until = Column(DateTime, nullable=True)
    
    created_by = Column(GUID(), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<PlatformAnnouncement(id={self.id}, title={self.title}, active={self.is_active})>"


class SystemSetting(Base):
    """
    Platform-wide configuration settings.
    """
    __tablename__ = "system_settings"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    key = Column(String(100), unique=True, nullable=False, index=True)
    value = Column(Text, nullable=True)
    value_type = Column(String(20), nullable=False, default="string")  # string, number, boolean, json
    category = Column(String(50), nullable=True, default="general", index=True)
    description = Column(String(500), nullable=True)
    is_public = Column(Boolean, default=False, nullable=False)  # Can be read by non-admins
    updated_by = Column(GUID(), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<SystemSetting(key={self.key}, value={self.value})>"


class ActivityLog(Base):
    """
    Extended activity log for platform-level tracking beyond audit logs.
    Captures user activity, system events, and analytics data.
    """
    __tablename__ = "activity_logs"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    society_id = Column(GUID(), ForeignKey("societies.id", ondelete="SET NULL"), nullable=True, index=True)
    activity_type = Column(String(50), nullable=False, index=True)  # login, logout, visitor_checkin, etc.
    description = Column(String(500), nullable=True)
    entity_type = Column(String(50), nullable=True, index=True)  # visitor, user, society, etc.
    entity_id = Column(GUID(), nullable=True, index=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    extra_data = Column(Text, nullable=True)  # JSON
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    def __repr__(self):
        return f"<ActivityLog(id={self.id}, type={self.activity_type})>"
