"""
Society and Building models for multi-society support.
"""
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.core.database import Base
from app.core.db_types import GUID


class Society(Base):
    """
    Society (housing society / apartment complex).
    """
    __tablename__ = "societies"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    address = Column(String(500), nullable=True)
    city = Column(String(100), nullable=True, index=True)
    state = Column(String(100), nullable=True)
    pincode = Column(String(20), nullable=True)
    country = Column(String(100), nullable=True, default="India")
    contact_email = Column(String(255), nullable=False, index=True)
    contact_phone = Column(String(20), nullable=True)
    # Official / document-related (optional; helps verify society)
    registration_number = Column(String(100), nullable=True, index=True)  # Society registration no.
    society_type = Column(String(100), nullable=True)  # e.g. Cooperative Housing, AOA
    registration_year = Column(String(10), nullable=True)
    documents_note = Column(String(500), nullable=True)  # e.g. "Documents submitted for verification"
    plan = Column(String(50), nullable=True, default="basic")
    status = Column(String(50), nullable=True, default="active")
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    buildings = relationship("Building", back_populates="society", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Society(id={self.id}, slug={self.slug}, name={self.name})>"


class Building(Base):
    """
    Building within a society (e.g. Tower A, Block B).
    """
    __tablename__ = "buildings"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    society_id = Column(GUID(), ForeignKey("societies.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    code = Column(String(50), nullable=True, index=True)
    sort_order = Column(Integer, nullable=True, default=0)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    society = relationship("Society", back_populates="buildings")

    def __repr__(self):
        return f"<Building(id={self.id}, name={self.name}, society_id={self.society_id})>"
