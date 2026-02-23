"""
Audit log for admin and sensitive actions (RBAC / OWASP compliance).
"""
from sqlalchemy import Column, String, DateTime, JSON
from datetime import datetime
import uuid

from app.core.database import Base
from app.core.db_types import GUID


class AuditLog(Base):
    """
    Immutable audit log: user_id, action, endpoint, timestamp, details.
    """
    __tablename__ = "audit_logs"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), nullable=False, index=True)
    action = Column(String(100), nullable=False, index=True)
    endpoint = Column(String(255), nullable=False)
    request_method = Column(String(10), nullable=True)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
