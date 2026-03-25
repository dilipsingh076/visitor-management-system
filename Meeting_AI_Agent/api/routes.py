import json

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from api.schemas import (
    MeetingCreate,
    MeetingResponse,
    TranscriptInput,
    TranscriptResponse,
    SummaryResponse,
    QueryInput,
    QueryResponse,
)
from db.database import get_db
from db import crud
from rag.embeddings import vector_store
from services.summary_service import generate_summary
from services.guardrail import is_meeting_related
from services.meeting_service import query_meetings

router = APIRouter()


def _meeting_to_response(meeting) -> MeetingResponse:
    return MeetingResponse(
        id=meeting.id,
        title=meeting.title,
        agenda=meeting.agenda,
        scheduled_at=meeting.scheduled_at,
        created_at=meeting.created_at,
        summary=meeting.summary,
        description=meeting.description,
        action_items=json.loads(meeting.action_items) if meeting.action_items else None,
        key_decisions=json.loads(meeting.key_decisions) if meeting.key_decisions else None,
    )


@router.post("/meetings", response_model=MeetingResponse, status_code=201)
def create_meeting(body: MeetingCreate, db: Session = Depends(get_db)):
    meeting = crud.create_meeting(
        db,
        title=body.title,
        agenda=body.agenda,
        scheduled_at=body.scheduled_at.isoformat() if body.scheduled_at else None,
    )
    return _meeting_to_response(meeting)


@router.get("/meetings", response_model=list[MeetingResponse])
def list_meetings(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    meetings = crud.list_meetings(db, limit=limit, offset=offset)
    return [_meeting_to_response(m) for m in meetings]


@router.get("/meetings/{meeting_id}", response_model=MeetingResponse)
def get_meeting(meeting_id: str, db: Session = Depends(get_db)):
    meeting = crud.get_meeting(db, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return _meeting_to_response(meeting)


@router.post("/meetings/{meeting_id}/transcripts", response_model=TranscriptResponse, status_code=201)
def add_transcript(meeting_id: str, body: TranscriptInput, db: Session = Depends(get_db)):
    meeting = crud.get_meeting(db, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    transcript = crud.add_transcript(db, meeting_id=meeting_id, content=body.content)
    vector_store.add_transcript(meeting_id, body.content)

    return TranscriptResponse(status="ok", transcript_id=transcript.id)


@router.post("/meetings/{meeting_id}/summarize", response_model=SummaryResponse)
def summarize_meeting(meeting_id: str, db: Session = Depends(get_db)):
    meeting = crud.get_meeting(db, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    transcripts = crud.get_transcripts(db, meeting_id)
    if not transcripts:
        raise HTTPException(status_code=400, detail="No transcripts found for this meeting")

    full_text = "\n\n".join(t.content for t in transcripts)
    result = generate_summary(
        text=full_text,
        title=meeting.title,
        agenda=meeting.agenda or "",
        meeting_id=meeting_id,
    )

    crud.update_meeting_summary(
        db,
        meeting_id=meeting_id,
        summary=result["summary"],
        description=result["description"],
        action_items=result["action_items"],
        key_decisions=result["key_decisions"],
    )

    return SummaryResponse(meeting_id=meeting_id, **result)


@router.post("/query", response_model=QueryResponse)
def query(body: QueryInput):
    if not is_meeting_related(body.question):
        return QueryResponse(
            answer="I can only respond to meeting-related queries.",
            source_meeting_ids=[],
        )

    result = query_meetings(body.question)
    return QueryResponse(**result)
