"""Pydantic schemas for Meeting AI endpoints."""
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field


# --- Requests ---

class MeetingCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    agenda: Optional[str] = None
    scheduled_at: Optional[datetime] = None


class TranscriptCreate(BaseModel):
    content: str = Field(..., min_length=1)


class QueryRequest(BaseModel):
    question: str = Field(..., min_length=1)


# --- Responses ---

class TranscriptResponse(BaseModel):
    id: str
    meeting_id: str
    content: Optional[str] = None
    audio_file_key: Optional[str] = None
    transcription_status: str = "completed"
    created_at: datetime

    class Config:
        from_attributes = True


class MeetingResponse(BaseModel):
    id: str
    society_id: str
    created_by: str
    title: str
    agenda: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    summary: Optional[str] = None
    description: Optional[str] = None
    action_items: Optional[list[str]] = None
    key_decisions: Optional[list[str]] = None
    created_at: datetime
    transcripts: list[TranscriptResponse] = []

    class Config:
        from_attributes = True


class MeetingListResponse(BaseModel):
    id: str
    title: str
    agenda: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    summary: Optional[str] = None
    created_at: datetime
    transcript_count: int = 0

    class Config:
        from_attributes = True


class SummaryResponse(BaseModel):
    meeting_id: str
    summary: str
    action_items: list[str]
    key_decisions: list[str]
    description: str


class QueryResponse(BaseModel):
    answer: str
    source_meeting_ids: list[str]


class TranscriptAddResponse(BaseModel):
    status: str
    transcript_id: str
