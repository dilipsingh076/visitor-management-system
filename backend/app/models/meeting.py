"""
Meeting and Transcript models for AI-powered meeting management.
Scoped by society_id for multi-society support.
"""
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.core.database import Base
from app.core.db_types import GUID


class Meeting(Base):
    """Meeting record with AI-generated summary fields."""
    __tablename__ = "meetings"
    __table_args__ = (
        Index("ix_meetings_society_id_created_at", "society_id", "created_at"),
    )

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    society_id = Column(GUID(), ForeignKey("societies.id"), nullable=False, index=True)
    created_by = Column(GUID(), ForeignKey("users.id"), nullable=False)
    title = Column(String(500), nullable=False)
    agenda = Column(Text, nullable=True)
    scheduled_at = Column(DateTime, nullable=True)
    summary = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    action_items = Column(Text, nullable=True)  # JSON array as string
    key_decisions = Column(Text, nullable=True)  # JSON array as string
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    transcripts = relationship("Transcript", back_populates="meeting", cascade="all, delete-orphan")


class Transcript(Base):
    """Meeting transcript content. Can be text-entered or audio-transcribed."""
    __tablename__ = "transcripts"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    meeting_id = Column(GUID(), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(Text, nullable=True)  # Nullable: empty while transcribing audio
    audio_file_key = Column(String(500), nullable=True)  # MinIO object key
    transcription_status = Column(String(20), nullable=False, default="completed")  # completed | transcribing | failed
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    meeting = relationship("Meeting", back_populates="transcripts")
