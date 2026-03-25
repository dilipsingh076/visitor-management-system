"""
Society, Building, Flat, and FlatMember models for multi-society support.
"""
from sqlalchemy import Column, String, Boolean, DateTime, Date, ForeignKey, Integer, UniqueConstraint, Index
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
    flats = relationship("Flat", back_populates="building", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Building(id={self.id}, name={self.name}, society_id={self.society_id})>"


class Flat(Base):
    """
    Individual flat/unit within a building. First-class entity with UUID.
    One user account (owner) per flat; flat members are data records.
    """
    __tablename__ = "flats"
    __table_args__ = (
        UniqueConstraint("building_id", "flat_number", name="uq_flats_building_flat_number"),
        Index("ix_flats_building_id", "building_id"),
    )

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    building_id = Column(GUID(), ForeignKey("buildings.id", ondelete="CASCADE"), nullable=False)
    flat_number = Column(String(50), nullable=False)
    floor = Column(Integer, nullable=True)
    flat_type = Column(String(50), nullable=True)  # 1BHK, 2BHK, 3BHK, shop, office
    occupancy_status = Column(String(30), nullable=False, default="vacant")  # vacant, occupied
    owner_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    building = relationship("Building", back_populates="flats")
    members = relationship("FlatMember", back_populates="flat", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Flat(id={self.id}, flat_number={self.flat_number}, building_id={self.building_id})>"


class FlatMember(Base):
    """
    Family member / occupant data for a flat. NOT a user account — just informational.
    Managed by the flat owner (resident).
    """
    __tablename__ = "flat_members"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    flat_id = Column(GUID(), ForeignKey("flats.id", ondelete="CASCADE"), nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    relation = Column(String(50), nullable=False)  # spouse, parent, child, sibling, other
    date_of_birth = Column(Date, nullable=True)
    photo_url = Column(String(500), nullable=True)
    id_proof_type = Column(String(50), nullable=True)  # aadhaar, pan, etc. (optional)
    id_proof_number = Column(String(255), nullable=True)  # optional
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    flat = relationship("Flat", back_populates="members")

    def __repr__(self):
        return f"<FlatMember(id={self.id}, full_name={self.full_name}, flat_id={self.flat_id})>"


class Amenity(Base):
    """
    Society amenity (pool, gym, clubhouse, playground, etc.).
    """
    __tablename__ = "amenities"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    society_id = Column(GUID(), ForeignKey("societies.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    code = Column(String(50), nullable=True)
    description = Column(String(500), nullable=True)
    status = Column(String(50), nullable=False, default="operational")  # operational, maintenance, closed
    sort_order = Column(Integer, nullable=True, default=0)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Amenity(id={self.id}, name={self.name}, society_id={self.society_id})>"


class MaintenanceStaff(Base):
    """
    Society maintenance staff (plumber, electrician, housekeeping, etc.).
    """
    __tablename__ = "maintenance_staff"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    society_id = Column(GUID(), ForeignKey("societies.id", ondelete="CASCADE"), nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    role = Column(String(100), nullable=False)  # plumber, electrician, housekeeping, security, etc.
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    building_id = Column(GUID(), ForeignKey("buildings.id", ondelete="SET NULL"), nullable=True, index=True)
    notes = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<MaintenanceStaff(id={self.id}, full_name={self.full_name}, role={self.role})>"
