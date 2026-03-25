from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.orm import DeclarativeBase, relationship
import uuid
from datetime import datetime, timezone


class Base(DeclarativeBase):
    pass


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    agenda = Column(Text, nullable=True)
    scheduled_at = Column(String, nullable=True)
    created_at = Column(String, nullable=False, default=lambda: datetime.now(timezone.utc).isoformat())
    summary = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    action_items = Column(Text, nullable=True)  # JSON array as string
    key_decisions = Column(Text, nullable=True)  # JSON array as string

    transcripts = relationship("Transcript", back_populates="meeting", cascade="all, delete-orphan")


class Transcript(Base):
    __tablename__ = "transcripts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id = Column(String, ForeignKey("meetings.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(String, nullable=False, default=lambda: datetime.now(timezone.utc).isoformat())

    meeting = relationship("Meeting", back_populates="transcripts")
