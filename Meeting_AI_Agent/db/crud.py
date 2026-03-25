import json
import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from db.models import Meeting, Transcript


def create_meeting(db: Session, title: str, agenda: str | None = None, scheduled_at: str | None = None) -> Meeting:
    meeting = Meeting(
        id=str(uuid.uuid4()),
        title=title,
        agenda=agenda,
        scheduled_at=scheduled_at,
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return meeting


def get_meeting(db: Session, meeting_id: str) -> Meeting | None:
    return db.query(Meeting).filter(Meeting.id == meeting_id).first()


def list_meetings(db: Session, limit: int = 20, offset: int = 0) -> list[Meeting]:
    return db.query(Meeting).order_by(Meeting.created_at.desc()).offset(offset).limit(limit).all()


def add_transcript(db: Session, meeting_id: str, content: str) -> Transcript:
    transcript = Transcript(
        id=str(uuid.uuid4()),
        meeting_id=meeting_id,
        content=content,
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    db.add(transcript)
    db.commit()
    db.refresh(transcript)
    return transcript


def get_transcripts(db: Session, meeting_id: str) -> list[Transcript]:
    return db.query(Transcript).filter(Transcript.meeting_id == meeting_id).all()


def update_meeting_summary(
    db: Session,
    meeting_id: str,
    summary: str,
    description: str,
    action_items: list[str],
    key_decisions: list[str],
) -> Meeting:
    meeting = get_meeting(db, meeting_id)
    meeting.summary = summary
    meeting.description = description
    meeting.action_items = json.dumps(action_items)
    meeting.key_decisions = json.dumps(key_decisions)
    db.commit()
    db.refresh(meeting)
    return meeting
