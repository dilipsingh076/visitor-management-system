"""
Society-level Complaints API endpoints for committee members.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, or_
from typing import Optional
from datetime import datetime
from uuid import UUID

from app.core.dependencies import get_db, get_current_user_id
from app.core.rbac import require_committee
from app.models import User
from app.models.complaint import Complaint, ComplaintComment
from app.schemas.complaint import (
    ComplaintCreate, ComplaintUpdate,
    ComplaintResponse, ComplaintListResponse,
    ComplaintCommentCreate, ComplaintCommentResponse,
    ComplaintStats,
)

router = APIRouter()


async def get_user_society_id(user_id: UUID, db: AsyncSession) -> Optional[UUID]:
    """Get the society ID for a user."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    return user.society_id if user else None


@router.get("", response_model=ComplaintListResponse)
async def list_society_complaints(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_committee),
    current_user_id: UUID = Depends(get_current_user_id),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
):
    """List complaints for the user's society."""
    society_id = await get_user_society_id(current_user_id, db)
    if not society_id:
        raise HTTPException(status_code=400, detail="User not associated with a society")

    query = select(Complaint).where(Complaint.society_id == society_id)
    count_query = select(func.count(Complaint.id)).where(Complaint.society_id == society_id)

    if search:
        search_filter = or_(
            Complaint.title.ilike(f"%{search}%"),
            Complaint.description.ilike(f"%{search}%"),
        )
        query = query.where(search_filter)
        count_query = count_query.where(search_filter)

    if status:
        query = query.where(Complaint.status == status)
        count_query = count_query.where(Complaint.status == status)

    if priority:
        query = query.where(Complaint.priority == priority)
        count_query = count_query.where(Complaint.priority == priority)

    if category:
        query = query.where(Complaint.category == category)
        count_query = count_query.where(Complaint.category == category)

    total = await db.scalar(count_query)

    offset = (page - 1) * page_size
    query = query.order_by(desc(Complaint.created_at)).offset(offset).limit(page_size)
    result = await db.execute(query)
    complaints = result.scalars().all()

    # Get user names
    user_ids = set()
    for c in complaints:
        if c.filed_by:
            user_ids.add(c.filed_by)
        if c.assigned_to:
            user_ids.add(c.assigned_to)

    user_map = {}
    if user_ids:
        user_result = await db.execute(select(User).where(User.id.in_(user_ids)))
        for u in user_result.scalars().all():
            user_map[u.id] = u.full_name

    items = []
    for c in complaints:
        item = ComplaintResponse(
            id=c.id,
            society_id=c.society_id,
            filed_by=c.filed_by,
            assigned_to=c.assigned_to,
            title=c.title,
            description=c.description,
            category=c.category,
            priority=c.priority,
            status=c.status,
            resolution_notes=c.resolution_notes,
            resolved_at=c.resolved_at,
            resolved_by=c.resolved_by,
            escalated=c.escalated,
            escalated_at=c.escalated_at,
            escalation_reason=c.escalation_reason,
            created_at=c.created_at,
            updated_at=c.updated_at,
            society_name=None,
            filed_by_name=user_map.get(c.filed_by) if c.filed_by else None,
            assigned_to_name=user_map.get(c.assigned_to) if c.assigned_to else None,
        )
        items.append(item)

    return ComplaintListResponse(
        items=items,
        total=total or 0,
        page=page,
        page_size=page_size,
        total_pages=(total or 0 + page_size - 1) // page_size if total else 0,
    )


@router.get("/stats", response_model=ComplaintStats)
async def get_society_complaint_stats(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_committee),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Get complaint statistics for the user's society."""
    society_id = await get_user_society_id(current_user_id, db)
    if not society_id:
        raise HTTPException(status_code=400, detail="User not associated with a society")

    base_filter = Complaint.society_id == society_id

    total = await db.scalar(select(func.count(Complaint.id)).where(base_filter))
    open_count = await db.scalar(
        select(func.count(Complaint.id)).where(base_filter, Complaint.status == "open")
    )
    in_progress = await db.scalar(
        select(func.count(Complaint.id)).where(base_filter, Complaint.status == "in_progress")
    )
    resolved = await db.scalar(
        select(func.count(Complaint.id)).where(base_filter, Complaint.status == "resolved")
    )
    escalated = await db.scalar(
        select(func.count(Complaint.id)).where(base_filter, Complaint.escalated == True)
    )

    # By category
    by_category = {}
    category_result = await db.execute(
        select(Complaint.category, func.count(Complaint.id))
        .where(base_filter)
        .group_by(Complaint.category)
    )
    for row in category_result:
        by_category[row[0]] = row[1]

    # By priority
    by_priority = {}
    priority_result = await db.execute(
        select(Complaint.priority, func.count(Complaint.id))
        .where(base_filter)
        .group_by(Complaint.priority)
    )
    for row in priority_result:
        by_priority[row[0]] = row[1]

    return ComplaintStats(
        total=total or 0,
        open=open_count or 0,
        in_progress=in_progress or 0,
        resolved=resolved or 0,
        escalated=escalated or 0,
        by_category=by_category,
        by_priority=by_priority,
    )


@router.post("", response_model=ComplaintResponse)
async def create_complaint(
    complaint: ComplaintCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_committee),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Create a new complaint for the society."""
    society_id = await get_user_society_id(current_user_id, db)
    if not society_id:
        raise HTTPException(status_code=400, detail="User not associated with a society")

    new_complaint = Complaint(
        society_id=society_id,
        filed_by=current_user_id,
        title=complaint.title,
        description=complaint.description,
        category=complaint.category,
        priority=complaint.priority or "medium",
        status="open",
    )
    db.add(new_complaint)
    await db.commit()
    await db.refresh(new_complaint)

    # Get user name
    user_result = await db.execute(select(User).where(User.id == current_user_id))
    user = user_result.scalar_one_or_none()
    filed_by_name = user.full_name if user else None

    return ComplaintResponse(
        id=new_complaint.id,
        society_id=new_complaint.society_id,
        filed_by=new_complaint.filed_by,
        assigned_to=new_complaint.assigned_to,
        title=new_complaint.title,
        description=new_complaint.description,
        category=new_complaint.category,
        priority=new_complaint.priority,
        status=new_complaint.status,
        resolution_notes=new_complaint.resolution_notes,
        resolved_at=new_complaint.resolved_at,
        resolved_by=new_complaint.resolved_by,
        escalated=new_complaint.escalated,
        escalated_at=new_complaint.escalated_at,
        escalation_reason=new_complaint.escalation_reason,
        created_at=new_complaint.created_at,
        updated_at=new_complaint.updated_at,
        society_name=None,
        filed_by_name=filed_by_name,
        assigned_to_name=None,
    )


@router.get("/{complaint_id}", response_model=ComplaintResponse)
async def get_society_complaint(
    complaint_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_committee),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Get a specific complaint in the user's society."""
    society_id = await get_user_society_id(current_user_id, db)
    if not society_id:
        raise HTTPException(status_code=400, detail="User not associated with a society")

    result = await db.execute(
        select(Complaint).where(Complaint.id == complaint_id, Complaint.society_id == society_id)
    )
    complaint = result.scalar_one_or_none()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    # Get user names
    user_ids = set()
    if complaint.filed_by:
        user_ids.add(complaint.filed_by)
    if complaint.assigned_to:
        user_ids.add(complaint.assigned_to)

    user_map = {}
    if user_ids:
        user_result = await db.execute(select(User).where(User.id.in_(user_ids)))
        for u in user_result.scalars().all():
            user_map[u.id] = u.full_name

    return ComplaintResponse(
        id=complaint.id,
        society_id=complaint.society_id,
        filed_by=complaint.filed_by,
        assigned_to=complaint.assigned_to,
        title=complaint.title,
        description=complaint.description,
        category=complaint.category,
        priority=complaint.priority,
        status=complaint.status,
        resolution_notes=complaint.resolution_notes,
        resolved_at=complaint.resolved_at,
        resolved_by=complaint.resolved_by,
        escalated=complaint.escalated,
        escalated_at=complaint.escalated_at,
        escalation_reason=complaint.escalation_reason,
        created_at=complaint.created_at,
        updated_at=complaint.updated_at,
        society_name=None,
        filed_by_name=user_map.get(complaint.filed_by) if complaint.filed_by else None,
        assigned_to_name=user_map.get(complaint.assigned_to) if complaint.assigned_to else None,
    )


@router.patch("/{complaint_id}", response_model=ComplaintResponse)
async def update_society_complaint(
    complaint_id: UUID,
    update: ComplaintUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_committee),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Update a complaint in the user's society."""
    society_id = await get_user_society_id(current_user_id, db)
    if not society_id:
        raise HTTPException(status_code=400, detail="User not associated with a society")

    result = await db.execute(
        select(Complaint).where(Complaint.id == complaint_id, Complaint.society_id == society_id)
    )
    complaint = result.scalar_one_or_none()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    update_data = update.model_dump(exclude_unset=True)

    # Handle resolution
    if update_data.get("status") == "resolved" and complaint.status != "resolved":
        update_data["resolved_at"] = datetime.utcnow()
        update_data["resolved_by"] = current_user_id

    for key, value in update_data.items():
        setattr(complaint, key, value)
    complaint.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(complaint)

    return await get_society_complaint(complaint_id, db, current_user, current_user_id)


@router.get("/{complaint_id}/comments")
async def list_society_complaint_comments(
    complaint_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_committee),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """List comments on a complaint in the user's society."""
    society_id = await get_user_society_id(current_user_id, db)
    if not society_id:
        raise HTTPException(status_code=400, detail="User not associated with a society")

    # Verify complaint belongs to society
    result = await db.execute(
        select(Complaint).where(Complaint.id == complaint_id, Complaint.society_id == society_id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Complaint not found")

    result = await db.execute(
        select(ComplaintComment)
        .where(ComplaintComment.complaint_id == complaint_id, ComplaintComment.is_internal == False)
        .order_by(ComplaintComment.created_at)
    )
    comments = result.scalars().all()

    # Get user names
    user_ids = set(c.user_id for c in comments if c.user_id)
    user_map = {}
    if user_ids:
        user_result = await db.execute(select(User).where(User.id.in_(user_ids)))
        for u in user_result.scalars().all():
            user_map[u.id] = u.full_name

    items = []
    for c in comments:
        items.append({
            "id": str(c.id),
            "complaint_id": str(c.complaint_id),
            "user_id": str(c.user_id) if c.user_id else None,
            "user_name": user_map.get(c.user_id) if c.user_id else None,
            "comment": c.comment,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        })

    return {"items": items}


@router.post("/{complaint_id}/comments", response_model=ComplaintCommentResponse)
async def add_society_complaint_comment(
    complaint_id: UUID,
    comment: ComplaintCommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_committee),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Add a comment to a complaint in the user's society."""
    society_id = await get_user_society_id(current_user_id, db)
    if not society_id:
        raise HTTPException(status_code=400, detail="User not associated with a society")

    # Verify complaint belongs to society
    result = await db.execute(
        select(Complaint).where(Complaint.id == complaint_id, Complaint.society_id == society_id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Complaint not found")

    new_comment = ComplaintComment(
        complaint_id=complaint_id,
        user_id=current_user_id,
        comment=comment.comment,
        is_internal=False,  # Society comments are not internal
    )
    db.add(new_comment)
    await db.commit()
    await db.refresh(new_comment)

    return ComplaintCommentResponse(
        id=new_comment.id,
        complaint_id=new_comment.complaint_id,
        user_id=new_comment.user_id,
        comment=new_comment.comment,
        is_internal=new_comment.is_internal,
        created_at=new_comment.created_at,
    )
