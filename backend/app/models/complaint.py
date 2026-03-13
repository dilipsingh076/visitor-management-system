"""
Complaint model for tracking issues across societies.
"""
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Integer
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.core.database import Base
from app.core.db_types import GUID


class ComplaintStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"
    ESCALATED = "escalated"


class ComplaintPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class ComplaintCategory(str, enum.Enum):
    VISITOR_ISSUE = "visitor_issue"
    SECURITY = "security"
    MAINTENANCE = "maintenance"
    NOISE = "noise"
    PARKING = "parking"
    AMENITIES = "amenities"
    BILLING = "billing"
    OTHER = "other"


class Complaint(Base):
    """
    Complaints filed by residents or society admins.
    """
    __tablename__ = "complaints"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    society_id = Column(GUID(), ForeignKey("societies.id", ondelete="CASCADE"), nullable=False, index=True)
    filed_by = Column(GUID(), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    assigned_to = Column(GUID(), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, default=ComplaintCategory.OTHER.value, index=True)
    priority = Column(String(20), nullable=False, default=ComplaintPriority.MEDIUM.value, index=True)
    status = Column(String(20), nullable=False, default=ComplaintStatus.OPEN.value, index=True)
    
    resolution_notes = Column(Text, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(GUID(), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    escalated = Column(Boolean, default=False, nullable=False)
    escalated_at = Column(DateTime, nullable=True)
    escalation_reason = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Complaint(id={self.id}, title={self.title}, status={self.status})>"


class ComplaintComment(Base):
    """
    Comments/updates on complaints.
    """
    __tablename__ = "complaint_comments"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    complaint_id = Column(GUID(), ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    comment = Column(Text, nullable=False)
    is_internal = Column(Boolean, default=False, nullable=False)  # Internal notes not visible to complainant
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<ComplaintComment(id={self.id}, complaint_id={self.complaint_id})>"
