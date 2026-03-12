"""Notifications API for host alerts and society notices."""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi import WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.responses import StreamingResponse
import asyncio
import json
from datetime import datetime
import structlog

from app.core.dependencies import (
    get_db,
    get_current_user_id,
    get_current_resident_or_admin,
    get_current_admin,
    get_current_society_id,
)
from app.core.security import verify_token
from app.core.notification_ws import register, unregister, broadcast_to_user
from app.models.notification import Notification
from app.models.user import User

router = APIRouter()
logger = structlog.get_logger()

class SocietyNoticeCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    body: str | None = Field(default=None, max_length=2000)


@router.get("/")
async def list_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_resident_or_admin),
    user_id: UUID = Depends(get_current_user_id),
    unread_only: bool = Query(False),
):
    """List notifications for current user (host). Resident or admin only."""
    q = select(Notification).where(Notification.user_id == user_id).order_by(Notification.created_at.desc())
    if unread_only:
        q = q.where(Notification.read == False)
    result = await db.execute(q)
    notifications = result.scalars().all()
    return [
        {
            "id": str(n.id),
            "type": n.type,
            "title": n.title,
            "body": n.body,
            "read": n.read,
            "extra_data": n.extra_data,
            "created_at": n.created_at.isoformat(),
        }
        for n in notifications
    ]


@router.patch("/{notification_id}/read")
async def mark_read(
    notification_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_resident_or_admin),
    user_id: UUID = Depends(get_current_user_id),
):
    """Mark notification as read. Resident or admin only; only own notifications."""
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == user_id,
        )
    )
    n = result.scalar_one_or_none()
    if not n:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    n.read = True
    await db.flush()
    return {"message": "Marked as read"}


@router.get("/stream")
async def stream_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_resident_or_admin),
    user_id: UUID = Depends(get_current_user_id),
):
    """
    Server-Sent Events stream for notifications.
    Uses a simple DB poll loop and emits events when new notifications are created.
    """

    async def event_gen():
        last_ts = datetime.utcnow()
        # Initial hello (lets client confirm connection)
        yield "event: ready\ndata: {}\n\n"
        while True:
            await asyncio.sleep(2)
            result = await db.execute(
                select(Notification)
                .where(Notification.user_id == user_id, Notification.created_at > last_ts)
                .order_by(Notification.created_at.asc())
            )
            rows = result.scalars().all()
            if rows:
                last_ts = rows[-1].created_at
                for n in rows:
                    payload = {
                        "id": str(n.id),
                        "type": n.type,
                        "title": n.title,
                        "body": n.body,
                        "read": n.read,
                        "extra_data": n.extra_data,
                        "created_at": n.created_at.isoformat(),
                    }
                    yield f"event: notification\ndata: {json.dumps(payload)}\n\n"

    return StreamingResponse(event_gen(), media_type="text/event-stream")


@router.websocket("/ws")
async def websocket_notifications(
    websocket: WebSocket,
    token: str = Query(..., alias="token"),
):
    """
    WebSocket endpoint for real-time notifications.
    Client connects with ?token=<access_token>. Server pushes JSON messages
    when new notifications are created for the user.
    """
    await websocket.accept()
    user_id = None
    try:
        # Validate Bearer token (client may send "Bearer xxx" or just "xxx")
        raw = token.strip()
        if raw.lower().startswith("bearer "):
            raw = raw[7:].strip()
        user = await verify_token(raw)
        uid_str = user.get("user_id")
        if not uid_str:
            await websocket.close(code=4008)
            return
        user_id = UUID(uid_str)
    except Exception as e:
        logger.warning("WebSocket auth failed", error=str(e))
        await websocket.close(code=4008)
        return

    await register(websocket, user_id)
    try:
        # Send initial connected message
        await websocket.send_text(json.dumps({"event": "connected", "user_id": str(user_id)}))
        # Keep connection open; receive loop to detect disconnect
        while True:
            data = await websocket.receive_text()
            # Optional: client can send ping and we pong
            if data.strip() == "ping":
                await websocket.send_text(json.dumps({"event": "pong"}))
    except WebSocketDisconnect:
        pass
    finally:
        if user_id is not None:
            await unregister(websocket, user_id)


@router.post("/society", status_code=status.HTTP_201_CREATED)
async def create_society_notice(
    payload: SocietyNoticeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_admin),
    society_id: UUID = Depends(get_current_society_id),
):
    """
    Create a society-wide notice by inserting a notification row for each active user in the society.
    Committee only.
    """
    result = await db.execute(
        select(User.id).where(User.society_id == society_id, User.is_active == True)  # noqa: E712
    )
    user_ids = [row[0] for row in result.all()]
    if not user_ids:
        return {"message": "No active users in society", "created": 0}

    # Insert one notification per user (simple & reliable; can optimize later)
    for uid in user_ids:
        db.add(
            Notification(
                user_id=uid,
                type="society_notice",
                title=payload.title.strip(),
                body=(payload.body.strip() if payload.body else None),
                read=False,
                extra_data=None,
            )
        )
    await db.flush()
    await db.flush()

    # Push to all connected WebSocket clients for each user
    ws_payload = {
        "event": "notification",
        "payload": {
            "type": "society_notice",
            "title": payload.title.strip(),
            "body": (payload.body.strip() if payload.body else None),
        },
    }
    for uid in user_ids:
        asyncio.create_task(broadcast_to_user(uid, ws_payload))

    return {"message": "Notice created", "created": len(user_ids)}
