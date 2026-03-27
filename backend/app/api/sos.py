"""
SOS alert endpoints.
Creates an SOS event and notifies all users in the same society.
"""

import asyncio
import json
from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, get_current_any_role, get_current_user, get_current_user_id, get_current_society_id
from app.core.notification_ws import broadcast_to_society
from app.core.roles import SOCIETY_ADMIN_ROLES
from app.models.notification import Notification
from app.models.sos import SosEvent
from app.models.user import User
from app.schemas.sos import SosCreateRequest, SosResponse

router = APIRouter()

def _is_guard_or_committee(current_user: dict) -> bool:
    roles = current_user.get("realm_access", {}).get("roles", []) or []
    if "guard" in roles:
        return True
    return any(r in roles for r in SOCIETY_ADMIN_ROLES)


@router.post("/", response_model=SosResponse, status_code=status.HTTP_201_CREATED)
async def create_sos(
    payload: SosCreateRequest,
    db: AsyncSession = Depends(get_db),
    _current_user: dict = Depends(get_current_any_role),
    user_id: UUID = Depends(get_current_user_id),
    society_id: UUID = Depends(get_current_society_id),
):
    """
    Create a society SOS alert (any authenticated user with a society).
    Notifies all active users in the same society via notifications + real-time broadcast.
    """
    sos_type = (payload.type or "").strip().lower()
    if not sos_type:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="type is required")

    note = (payload.note or "").strip() or None

    event = SosEvent(
        society_id=society_id,
        raised_by_user_id=user_id,
        type=sos_type,
        note=note,
        status="open",
    )
    db.add(event)
    await db.flush()

    # Insert one notification row per user (reliable delivery for bell + list)
    result = await db.execute(
        select(User.id).where(User.society_id == society_id, User.is_active == True)  # noqa: E712
    )
    user_ids = [row[0] for row in result.all()]
    if not user_ids:
        return event

    title = f"SOS: {sos_type.upper()}"
    body = note or "Emergency alert raised. Please take action immediately."
    extra = json.dumps(
        {
            "sos_event_id": str(event.id),
            "raised_by_user_id": str(user_id),
            "type": sos_type,
        }
    )
    for uid in user_ids:
        db.add(
            Notification(
                user_id=uid,
                type="sos_alert",
                title=title,
                body=body,
                read=False,
                extra_data=extra,
            )
        )
    await db.flush()

    # Real-time: tell clients to refresh notification queries
    ws_payload = {
        "event": "notification",
        "payload": {
            "type": "sos_alert",
            "title": title,
            "body": body,
            "extra_data": extra,
        },
    }
    asyncio.create_task(broadcast_to_society(society_id, ws_payload))

    return event


@router.get("/active", response_model=SosResponse | None)
async def get_active_sos(
    db: AsyncSession = Depends(get_db),
    _current_user: dict = Depends(get_current_any_role),
    society_id: UUID = Depends(get_current_society_id),
):
    """
    Return the most recent open SOS event for the current user's society (or null).
    """
    result = await db.execute(
        select(SosEvent, User.full_name)
        .join(User, User.id == SosEvent.raised_by_user_id)
        .where(SosEvent.society_id == society_id, SosEvent.status == "open")
        .order_by(SosEvent.created_at.desc())
        .limit(1)
    )
    row = result.first()
    if not row:
        return None
    event, raised_by_name = row
    data = SosResponse.model_validate(event).model_dump()
    data["raised_by_name"] = raised_by_name
    return data

@router.patch("/{sos_id}/resolve", response_model=SosResponse)
async def resolve_sos(
    sos_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    user_id: UUID = Depends(get_current_user_id),
    society_id: UUID = Depends(get_current_society_id),
):
    """
    Guards + committee can resolve an SOS event for their society.
    Once resolved, /sos/active will return null and the live banner disappears.
    """
    if not _is_guard_or_committee(current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Guard or committee access required")

    result = await db.execute(select(SosEvent).where(SosEvent.id == sos_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SOS event not found")
    if event.society_id != society_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    if event.status != "open":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="SOS event is not open")

    event.status = "resolved"
    event.resolved_by_user_id = user_id
    event.resolved_at = datetime.utcnow()
    await db.flush()

    # Notify society that SOS was resolved (new notification entry for all users)
    result = await db.execute(
        select(User.id).where(User.society_id == society_id, User.is_active == True)  # noqa: E712
    )
    user_ids = [row[0] for row in result.all()]
    title = f"SOS resolved: {str(event.type or '').upper()}"
    body = "The emergency alert has been marked resolved."
    extra = json.dumps(
        {
            "sos_event_id": str(event.id),
            "resolved_by_user_id": str(user_id),
            "type": (event.type or "").strip().lower(),
        }
    )
    for uid in user_ids:
        db.add(
            Notification(
                user_id=uid,
                type="sos_resolved",
                title=title,
                body=body,
                read=False,
                extra_data=extra,
            )
        )
    await db.flush()

    # Broadcast refresh to society so clients update notifications + banner
    ws_payload = {
        "event": "notification",
        "payload": {"type": "sos_resolved", "title": title, "body": body, "extra_data": extra},
    }
    asyncio.create_task(broadcast_to_society(society_id, ws_payload))

    raised_by = await db.execute(select(User.full_name).where(User.id == event.raised_by_user_id))
    raised_by_name = raised_by.scalar_one_or_none()
    data = SosResponse.model_validate(event).model_dump()
    data["raised_by_name"] = raised_by_name
    return data

