"""
Visitor and Visit models.
"""
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, JSON, TypeDecorator
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.core.database import Base
from app.core.db_types import GUID


class VisitStatus(str, enum.Enum):
    """Visit status enumeration."""
    PENDING = "pending"
    APPROVED = "approved"
    CHECKED_IN = "checked_in"
    CHECKED_OUT = "checked_out"
    CANCELLED = "cancelled"


class VisitStatusType(TypeDecorator):
    """Store VisitStatus as VARCHAR so PostgreSQL/Supabase avoid native ENUM type mismatch."""
    impl = String(20)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, VisitStatus):
            return value.value
        return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, VisitStatus):
            return value
        return VisitStatus(value) if value else None


class Visitor(Base):
    """
    Visitor profile (reusable across visits).
    """
    __tablename__ = "visitors"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    phone = Column(String(20), nullable=False, index=True)
    email = Column(String(255), nullable=True, index=True)
    full_name = Column(String(255), nullable=False)
    id_proof_type = Column(String(50), nullable=True)  # aadhaar, pan, driving_license, etc.
    id_proof_number = Column(String(255), nullable=True, index=True)
    id_proof_image_url = Column(String(500), nullable=True)  # Stored in MinIO
    photo_url = Column(String(500), nullable=True)  # Profile photo in MinIO
    is_blacklisted = Column(Boolean, default=False, nullable=False)
    extra_data = Column(JSON, nullable=True)  # Additional visitor data
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    visits = relationship("Visit", back_populates="visitor", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Visitor(id={self.id}, phone={self.phone}, name={self.full_name})>"


class Visit(Base):
    """
    Visit record (one visitor can have multiple visits).
    """
    __tablename__ = "visits"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    visitor_id = Column(GUID(), ForeignKey("visitors.id"), nullable=False, index=True)
    host_id = Column(GUID(), ForeignKey("users.id"), nullable=False, index=True)
    status = Column(VisitStatusType(), default=VisitStatus.PENDING, nullable=False, index=True)
    
    # Visit details
    purpose = Column(String(255), nullable=True)
    expected_arrival = Column(DateTime, nullable=True)
    actual_arrival = Column(DateTime, nullable=True)
    actual_departure = Column(DateTime, nullable=True)
    
    # Check-in data
    qr_code = Column(String(255), unique=True, nullable=True, index=True)
    otp = Column(String(6), nullable=True, index=True)
    otp_expires_at = Column(DateTime, nullable=True)
    checkin_photo_url = Column(String(500), nullable=True)  # Photo captured at check-in
    
    # DPDP compliance
    consent_given = Column(Boolean, default=False, nullable=False)
    consent_timestamp = Column(DateTime, nullable=True)
    
    # Extra data
    extra_data = Column(JSON, nullable=True)  # Additional visit data
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    visitor = relationship("Visitor", back_populates="visits")
    host = relationship("User")
    consent_logs = relationship("ConsentLog", back_populates="visit", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Visit(id={self.id}, visitor_id={self.visitor_id}, status={self.status})>"


class ConsentLog(Base):
    """
    Immutable consent log for DPDP Act compliance.
    """
    __tablename__ = "consent_logs"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    visit_id = Column(GUID(), ForeignKey("visits.id"), nullable=False, index=True)
    consent_type = Column(String(50), nullable=False)  # data_collection, photo_capture, data_sharing, etc.
    consent_given = Column(Boolean, nullable=False)
    consent_text = Column(Text, nullable=True)  # Text shown to visitor
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    visit = relationship("Visit", back_populates="consent_logs")

    def __repr__(self):
        return f"<ConsentLog(id={self.id}, visit_id={self.visit_id}, consent_given={self.consent_given})>"


class Blacklist(Base):
    """
    Blacklisted visitors.
    """
    __tablename__ = "blacklist"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    visitor_id = Column(GUID(), ForeignKey("visitors.id"), nullable=False, index=True)
    reason = Column(Text, nullable=False)
    blacklisted_by = Column(GUID(), ForeignKey("users.id"), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    visitor = relationship("Visitor")
    blacklisted_by_user = relationship("User")

    def __repr__(self):
        return f"<Blacklist(id={self.id}, visitor_id={self.visitor_id}, is_active={self.is_active})>"
