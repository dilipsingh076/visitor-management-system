"""
User model (residents, guards, admins).
"""
from sqlalchemy import Column, String, Boolean, DateTime, JSON
from datetime import datetime
import uuid

from app.core.database import Base
from app.core.db_types import GUID


class User(Base):
    """
    User model for residents, guards, and admins.
    Keycloak handles authentication, this table stores additional profile data.
    """
    __tablename__ = "users"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    keycloak_id = Column(String(255), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20), nullable=True, index=True)
    full_name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    role = Column(String(50), nullable=False)  # admin, guard, resident
    extra_data = Column(JSON, nullable=True)  # Additional profile data
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"
