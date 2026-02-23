"""Notification model for host alerts."""
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from datetime import datetime
import uuid

from app.core.database import Base
from app.core.db_types import GUID


class Notification(Base):
    """In-app notification for hosts (e.g. visitor arrived)."""

    __tablename__ = "notifications"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False, index=True)
    type = Column(String(50), nullable=False)  # visitor_arrived, walkin_pending, etc.
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=True)
    read = Column(Boolean, default=False, nullable=False)
    extra_data = Column(Text, nullable=True)  # JSON: visit_id, visitor_name, etc.
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
