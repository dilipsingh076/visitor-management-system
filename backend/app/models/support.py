"""
Support ticket model for platform-level support.
"""
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from datetime import datetime
import uuid
import enum

from app.core.database import Base
from app.core.db_types import GUID


class TicketStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    WAITING_ON_CUSTOMER = "waiting_on_customer"
    RESOLVED = "resolved"
    CLOSED = "closed"


class TicketPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class TicketCategory(str, enum.Enum):
    ACCOUNT = "account"
    BILLING = "billing"
    TECHNICAL = "technical"
    FEATURE_REQUEST = "feature_request"
    BUG_REPORT = "bug_report"
    OTHER = "other"


class SupportTicket(Base):
    """
    Support tickets from societies/users to platform admin.
    """
    __tablename__ = "support_tickets"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    ticket_number = Column(String(50), unique=True, nullable=False, index=True)
    society_id = Column(GUID(), ForeignKey("societies.id", ondelete="SET NULL"), nullable=True, index=True)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    assigned_to = Column(GUID(), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    subject = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, default=TicketCategory.OTHER.value, index=True)
    priority = Column(String(20), nullable=False, default=TicketPriority.MEDIUM.value, index=True)
    status = Column(String(30), nullable=False, default=TicketStatus.OPEN.value, index=True)
    
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(GUID(), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(20), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<SupportTicket(id={self.id}, ticket_number={self.ticket_number}, status={self.status})>"


class TicketMessage(Base):
    """
    Messages within a support ticket (conversation thread).
    """
    __tablename__ = "ticket_messages"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    ticket_id = Column(GUID(), ForeignKey("support_tickets.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    message = Column(Text, nullable=False)
    is_staff_reply = Column(Boolean, default=False, nullable=False)
    attachments = Column(Text, nullable=True)  # JSON array of file URLs
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<TicketMessage(id={self.id}, ticket_id={self.ticket_id})>"
