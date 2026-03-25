"""
Resident-facing Complaints API: residents can create and view their own complaints.
"""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, get_current_user
from app.models.complaint import Complaint, ComplaintComment
from app.models.user import User
from app.schemas.complaint import ComplaintCreate, ComplaintCommentCreate

router = APIRouter()


def _complaint_dict(c: Complaint) -> dict:
    return {
        "id": str(c.id),
        "title": c.title,
        "description": c.description,
        "category": c.category,
        "priority": c.priority,
        "status": c.status,
        "resolution_notes": c.resolution_notes,
        "resolved_at": c.resolved_at.isoformat() if c.resolved_at else None,
        "created_at": c.created_at.isoformat() if c.created_at else None,
        "updated_at": c.updated_at.isoformat() if c.updated_at else None,
    }


async def _get_user(current_user: dict, db: AsyncSession) -> User:
    user_id = current_user.get("user_id") or current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    result = await db.execute(select(User).where(User.id == UUID(str(user_id))))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.get("/my")
async def my_complaints(
    status: str | None = Query(None),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List complaints filed by the current user."""
    user = await _get_user(current_user, db)

    query = select(Complaint).where(Complaint.filed_by == user.id)
    if status:
        query = query.where(Complaint.status == status)
    query = query.order_by(desc(Complaint.created_at))

    result = await db.execute(query)
    complaints = result.scalars().all()
    return JSONResponse(content=[_complaint_dict(c) for c in complaints])


@router.post("/")
async def create_complaint(
    body: ComplaintCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new complaint (any authenticated user)."""
    user = await _get_user(current_user, db)
    if not user.society_id:
        raise HTTPException(status_code=400, detail="Not associated with a society")

    complaint = Complaint(
        society_id=user.society_id,
        filed_by=user.id,
        title=body.title,
        description=body.description,
        category=body.category,
        priority=body.priority or "medium",
        status="open",
    )
    db.add(complaint)
    await db.flush()

    return JSONResponse(content=_complaint_dict(complaint), status_code=201)


@router.get("/{complaint_id}")
async def get_complaint(
    complaint_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific complaint (only if filed by current user)."""
    user = await _get_user(current_user, db)

    try:
        cid = UUID(complaint_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid complaint_id")

    result = await db.execute(
        select(Complaint).where(Complaint.id == cid, Complaint.filed_by == user.id)
    )
    complaint = result.scalar_one_or_none()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    return JSONResponse(content=_complaint_dict(complaint))


@router.get("/{complaint_id}/comments")
async def list_comments(
    complaint_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List public comments on a complaint (only if filed by current user)."""
    user = await _get_user(current_user, db)

    try:
        cid = UUID(complaint_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid complaint_id")

    # Verify complaint belongs to user
    result = await db.execute(
        select(Complaint).where(Complaint.id == cid, Complaint.filed_by == user.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Complaint not found")

    result = await db.execute(
        select(ComplaintComment)
        .where(ComplaintComment.complaint_id == cid, ComplaintComment.is_internal == False)
        .order_by(ComplaintComment.created_at)
    )
    comments = result.scalars().all()

    # Get user names
    user_ids = set(c.user_id for c in comments if c.user_id)
    user_map = {}
    if user_ids:
        ur = await db.execute(select(User).where(User.id.in_(user_ids)))
        for u in ur.scalars().all():
            user_map[u.id] = u.full_name

    return JSONResponse(content=[{
        "id": str(c.id),
        "user_name": user_map.get(c.user_id, "Unknown") if c.user_id else None,
        "comment": c.comment,
        "created_at": c.created_at.isoformat() if c.created_at else None,
    } for c in comments])


@router.post("/{complaint_id}/comments")
async def add_comment(
    complaint_id: str,
    body: ComplaintCommentCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add a comment to a complaint (only if filed by current user)."""
    user = await _get_user(current_user, db)

    try:
        cid = UUID(complaint_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid complaint_id")

    result = await db.execute(
        select(Complaint).where(Complaint.id == cid, Complaint.filed_by == user.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Complaint not found")

    comment = ComplaintComment(
        complaint_id=cid,
        user_id=user.id,
        comment=body.comment,
        is_internal=False,
    )
    db.add(comment)
    await db.flush()

    return JSONResponse(content={
        "id": str(comment.id),
        "user_name": user.full_name,
        "comment": comment.comment,
        "created_at": comment.created_at.isoformat() if comment.created_at else None,
    }, status_code=201)
