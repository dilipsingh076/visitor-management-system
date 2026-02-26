"""
User model (residents, guards, admins).
"""
from sqlalchemy import Column, String, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.core.database import Base
from app.core.db_types import GUID


class User(Base):
    """
    User model for residents, guards, and admins.
    Can be authenticated via Keycloak (keycloak_id set) or local password (password_hash set).
    """
    __tablename__ = "users"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    keycloak_id = Column(String(255), unique=True, nullable=True, index=True)  # Nullable for local-auth users
    email = Column(String(255), unique=True, nullable=False, index=True)  # Unique globally for login
    phone = Column(String(20), nullable=True, index=True)
    full_name = Column(String(255), nullable=False)
    flat_number = Column(String(50), nullable=True, index=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=True)  # Email/account verification
    role = Column(String(50), nullable=False)  # admin, guard, resident, super_admin
    password_hash = Column(String(255), nullable=True)  # For local auth; null if Keycloak
    society_id = Column(GUID(), ForeignKey("societies.id", ondelete="SET NULL"), nullable=True, index=True)
    building_id = Column(GUID(), ForeignKey("buildings.id", ondelete="SET NULL"), nullable=True, index=True)
    last_login = Column(DateTime, nullable=True)
    extra_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    society = relationship("Society", backref="users")
    building = relationship("Building", backref="users")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"
