"""Notifications API for host alerts. Resident or admin only; data filtered by current user."""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.db.seed import ensure_demo_user
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, get_current_user_id, get_current_resident_or_admin
from app.models.notification import Notification

router = APIRouter()


@router.get("/")
async def list_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_resident_or_admin),
    user_id: UUID = Depends(get_current_user_id),
    unread_only: bool = Query(False),
):
    """List notifications for current user (host). Resident or admin only."""
    await ensure_demo_user(db)
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
    await ensure_demo_user(db)
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
