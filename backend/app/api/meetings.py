"""
Meeting AI API endpoints.
Access: chairman, secretary, treasurer, platform_admin only.
All meetings scoped by society_id.
"""
import json
from uuid import UUID

from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
import structlog

from app.core.config import settings
from app.core.dependencies import get_db, get_current_admin, get_current_society_id
from app.models.meeting import Meeting, Transcript
from app.schemas.meeting import (
    MeetingCreate,
    MeetingResponse,
    MeetingListResponse,
    TranscriptCreate,
    TranscriptResponse,
    TranscriptAddResponse,
    SummaryResponse,
    QueryRequest,
    QueryResponse,
)
from app.services.meeting_ai.summary_service import generate_summary
from app.services.meeting_ai.guardrail import is_meeting_related
from app.services.meeting_ai.meeting_service import query_meetings
from app.services.meeting_ai.embeddings import vector_store

logger = structlog.get_logger()
router = APIRouter()


def _meeting_to_response(meeting: Meeting) -> MeetingResponse:
    """Convert Meeting ORM object to response schema."""
    return MeetingResponse(
        id=str(meeting.id),
        society_id=str(meeting.society_id),
        created_by=str(meeting.created_by),
        title=meeting.title,
        agenda=meeting.agenda,
        scheduled_at=meeting.scheduled_at,
        summary=meeting.summary,
        description=meeting.description,
        action_items=json.loads(meeting.action_items) if meeting.action_items else None,
        key_decisions=json.loads(meeting.key_decisions) if meeting.key_decisions else None,
        created_at=meeting.created_at,
        transcripts=[
            TranscriptResponse(
                id=str(t.id),
                meeting_id=str(t.meeting_id),
                content=t.content,
                audio_file_key=t.audio_file_key,
                transcription_status=t.transcription_status or "completed",
                created_at=t.created_at,
            )
            for t in (meeting.transcripts or [])
        ],
    )


@router.post("", response_model=MeetingResponse, status_code=201)
async def create_meeting(
    body: MeetingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_admin),
    society_id: UUID = Depends(get_current_society_id),
):
    """Create a new meeting for the current society."""
    user_id = UUID(current_user["user_id"])
    meeting = Meeting(
        society_id=society_id,
        created_by=user_id,
        title=body.title,
        agenda=body.agenda,
        scheduled_at=body.scheduled_at,
    )
    db.add(meeting)
    await db.flush()
    await db.refresh(meeting, attribute_names=["transcripts"])
    logger.info("Meeting created", meeting_id=str(meeting.id), society_id=str(society_id))
    return _meeting_to_response(meeting)


@router.get("", response_model=list[MeetingListResponse])
async def list_meetings(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_admin),
    society_id: UUID = Depends(get_current_society_id),
):
    """List meetings for the current society (most recent first)."""
    # Get meetings with transcript count
    stmt = (
        select(
            Meeting,
            func.count(Transcript.id).label("transcript_count"),
        )
        .outerjoin(Transcript, Transcript.meeting_id == Meeting.id)
        .where(Meeting.society_id == society_id)
        .group_by(Meeting.id)
        .order_by(Meeting.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    result = await db.execute(stmt)
    rows = result.all()

    return [
        MeetingListResponse(
            id=str(meeting.id),
            title=meeting.title,
            agenda=meeting.agenda,
            scheduled_at=meeting.scheduled_at,
            summary=meeting.summary,
            created_at=meeting.created_at,
            transcript_count=count,
        )
        for meeting, count in rows
    ]


@router.get("/{meeting_id}", response_model=MeetingResponse)
async def get_meeting(
    meeting_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_admin),
    society_id: UUID = Depends(get_current_society_id),
):
    """Get a meeting with its transcripts."""
    stmt = (
        select(Meeting)
        .options(selectinload(Meeting.transcripts))
        .where(Meeting.id == meeting_id, Meeting.society_id == society_id)
    )
    result = await db.execute(stmt)
    meeting = result.scalar_one_or_none()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return _meeting_to_response(meeting)


@router.post("/{meeting_id}/transcripts", response_model=TranscriptAddResponse, status_code=201)
async def add_transcript(
    meeting_id: UUID,
    body: TranscriptCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_admin),
    society_id: UUID = Depends(get_current_society_id),
):
    """Add a transcript to a meeting and index it for AI search."""
    # Verify meeting exists and belongs to society
    stmt = select(Meeting).where(Meeting.id == meeting_id, Meeting.society_id == society_id)
    result = await db.execute(stmt)
    meeting = result.scalar_one_or_none()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    transcript = Transcript(meeting_id=meeting_id, content=body.content)
    db.add(transcript)
    await db.flush()
    await db.refresh(transcript)

    # Index in FAISS vector store for RAG
    try:
        vector_store.add_transcript(str(society_id), str(meeting_id), body.content)
    except Exception as e:
        logger.warning("FAISS indexing failed (Ollama may not be running)", error=str(e))

    logger.info("Transcript added", meeting_id=str(meeting_id), transcript_id=str(transcript.id))
    return TranscriptAddResponse(status="ok", transcript_id=str(transcript.id))


@router.post("/{meeting_id}/summarize", response_model=SummaryResponse)
async def summarize_meeting(
    meeting_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_admin),
    society_id: UUID = Depends(get_current_society_id),
):
    """Generate AI summary, action items, and key decisions from meeting transcripts."""
    stmt = (
        select(Meeting)
        .options(selectinload(Meeting.transcripts))
        .where(Meeting.id == meeting_id, Meeting.society_id == society_id)
    )
    result = await db.execute(stmt)
    meeting = result.scalar_one_or_none()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    completed = [t for t in meeting.transcripts if t.transcription_status == "completed" and t.content]
    if not completed:
        raise HTTPException(status_code=400, detail="No completed transcripts found for this meeting")

    full_text = "\n\n".join(t.content for t in completed)

    try:
        summary_result = generate_summary(
            text=full_text,
            title=meeting.title,
            agenda=meeting.agenda or "",
            meeting_id=str(meeting_id),
        )
    except Exception as e:
        logger.error("Summary generation failed", error=str(e), meeting_id=str(meeting_id))
        raise HTTPException(status_code=502, detail=f"AI summary generation failed: {str(e)}")

    # Save summary to database
    meeting.summary = summary_result["summary"]
    meeting.description = summary_result["description"]
    meeting.action_items = json.dumps(summary_result["action_items"])
    meeting.key_decisions = json.dumps(summary_result["key_decisions"])
    await db.flush()

    logger.info("Meeting summarized", meeting_id=str(meeting_id))
    return SummaryResponse(meeting_id=str(meeting_id), **summary_result)


@router.post("/query", response_model=QueryResponse)
async def query(
    body: QueryRequest,
    current_user: dict = Depends(get_current_admin),
    society_id: UUID = Depends(get_current_society_id),
):
    """Query across all society meetings using natural language (RAG)."""
    if not is_meeting_related(body.question):
        return QueryResponse(
            answer="I can only respond to meeting-related queries.",
            source_meeting_ids=[],
        )

    try:
        result = query_meetings(str(society_id), body.question)
    except Exception as e:
        logger.error("Meeting query failed", error=str(e))
        raise HTTPException(status_code=502, detail=f"AI query failed: {str(e)}")

    return QueryResponse(**result)


@router.delete("/{meeting_id}", status_code=204)
async def delete_meeting(
    meeting_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_admin),
    society_id: UUID = Depends(get_current_society_id),
):
    """Delete a meeting and its transcripts."""
    stmt = select(Meeting).where(Meeting.id == meeting_id, Meeting.society_id == society_id)
    result = await db.execute(stmt)
    meeting = result.scalar_one_or_none()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    await db.delete(meeting)
    await db.flush()
    logger.info("Meeting deleted", meeting_id=str(meeting_id))


@router.post("/{meeting_id}/audio", response_model=TranscriptAddResponse, status_code=201)
async def upload_audio(
    meeting_id: UUID,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_admin),
    society_id: UUID = Depends(get_current_society_id),
):
    """Upload audio file for transcription. Audio is saved locally and transcribed in the background."""
    from app.services.meeting_ai.transcription_service import (
        save_audio_locally,
        process_audio_transcript,
    )

    # Verify meeting exists and belongs to society
    stmt = select(Meeting).where(Meeting.id == meeting_id, Meeting.society_id == society_id)
    result = await db.execute(stmt)
    meeting = result.scalar_one_or_none()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    # Validate file size
    max_size = settings.AUDIO_MAX_SIZE_MB * 1024 * 1024
    file_data = await file.read()
    if len(file_data) > max_size:
        raise HTTPException(
            status_code=413,
            detail=f"Audio file too large. Max {settings.AUDIO_MAX_SIZE_MB}MB allowed.",
        )

    # Create transcript record with "transcribing" status
    transcript = Transcript(
        meeting_id=meeting_id,
        content=None,
        transcription_status="transcribing",
    )
    db.add(transcript)
    await db.flush()
    await db.refresh(transcript)

    # Save audio locally
    object_key = f"meetings/{society_id}/{meeting_id}/{transcript.id}.webm"
    try:
        save_audio_locally(file_data, object_key)
    except Exception as e:
        logger.error("Audio save failed", error=str(e))
        raise HTTPException(status_code=502, detail=f"Audio storage failed: {str(e)}")

    # Update transcript with audio key
    transcript.audio_file_key = object_key
    await db.flush()

    # Queue background transcription
    background_tasks.add_task(
        process_audio_transcript,
        transcript_id=str(transcript.id),
        meeting_id=str(meeting_id),
        society_id=str(society_id),
        audio_key=object_key,
        database_url=settings.DATABASE_URL,
    )

    logger.info("Audio upload queued for transcription", meeting_id=str(meeting_id), transcript_id=str(transcript.id))
    return TranscriptAddResponse(status="transcribing", transcript_id=str(transcript.id))


@router.get("/{meeting_id}/audio/{transcript_id}")
async def get_audio(
    meeting_id: UUID,
    transcript_id: UUID,
    token: str = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Stream audio file for a transcript. Accepts auth via Authorization header or ?token= query param."""
    from app.core.security import verify_token

    # Authenticate: try query param token first (for <audio> element), then header
    user = None
    if token:
        try:
            user = await verify_token(token)
        except Exception:
            pass

    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Check admin role
    roles = user.get("realm_access", {}).get("roles", [])
    from app.core.dependencies import ALL_ADMIN_ROLES
    if not any(r in roles for r in ALL_ADMIN_ROLES):
        raise HTTPException(status_code=403, detail="Admin access required")

    society_id = user.get("society_id")
    if not society_id:
        raise HTTPException(status_code=400, detail="Society ID not found")

    stmt = (
        select(Transcript)
        .join(Meeting, Meeting.id == Transcript.meeting_id)
        .where(
            Transcript.id == transcript_id,
            Transcript.meeting_id == meeting_id,
            Meeting.society_id == UUID(society_id),
        )
    )
    result = await db.execute(stmt)
    transcript = result.scalar_one_or_none()
    if not transcript or not transcript.audio_file_key:
        raise HTTPException(status_code=404, detail="Audio not found")

    audio_path = Path(settings.AUDIO_STORAGE_PATH) / transcript.audio_file_key
    if not audio_path.exists():
        raise HTTPException(status_code=404, detail="Audio file missing")

    return FileResponse(
        path=str(audio_path),
        media_type="audio/webm",
        filename=f"recording-{transcript_id}.webm",
    )
