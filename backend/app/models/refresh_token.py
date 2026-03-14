"""
Refresh token model for local JWT auth.
Opaque, hashed tokens stored per user with expiry and revocation.
"""
from datetime import datetime, timedelta
import uuid

from sqlalchemy import Column, DateTime, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.core.db_types import GUID


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash = Column(String(128), nullable=False, unique=True, index=True)
    user_agent = Column(String(255), nullable=True)
    ip_address = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    revoked = Column(Boolean, default=False, nullable=False)
    revoked_at = Column(DateTime, nullable=True)
    replaced_by = Column(GUID(), ForeignKey("refresh_tokens.id", ondelete="SET NULL"), nullable=True)

    user = relationship("User", backref="refresh_tokens", foreign_keys=[user_id])

    def is_active(self) -> bool:
        return not self.revoked and (self.expires_at > datetime.utcnow())

