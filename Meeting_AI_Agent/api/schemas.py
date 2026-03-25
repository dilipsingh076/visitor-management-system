from datetime import datetime

from pydantic import BaseModel


# --- Requests ---

class MeetingCreate(BaseModel):
    title: str
    agenda: str | None = None
    scheduled_at: datetime | None = None


class TranscriptInput(BaseModel):
    content: str


class QueryInput(BaseModel):
    question: str


# --- Responses ---

class MeetingResponse(BaseModel):
    id: str
    title: str
    agenda: str | None = None
    scheduled_at: str | None = None
    created_at: str
    summary: str | None = None
    description: str | None = None
    action_items: list[str] | None = None
    key_decisions: list[str] | None = None


class SummaryResponse(BaseModel):
    meeting_id: str
    summary: str
    action_items: list[str]
    key_decisions: list[str]
    description: str


class QueryResponse(BaseModel):
    answer: str
    source_meeting_ids: list[str]


class TranscriptResponse(BaseModel):
    status: str
    transcript_id: str
