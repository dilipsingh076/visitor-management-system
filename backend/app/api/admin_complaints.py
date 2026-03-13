"""
Platform Admin Complaints API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, or_
from typing import Optional
from datetime import datetime
from uuid import UUID

from app.core.dependencies import get_db, get_current_user_id
from app.core.rbac import log_admin_action
from app.api.admin import require_platform_admin
from app.models import Society, User
from app.models.complaint import Complaint, ComplaintComment
from app.schemas.complaint import (
    ComplaintCreate, ComplaintUpdate, ComplaintEscalate,
    ComplaintResponse, ComplaintListResponse,
    ComplaintCommentCreate, ComplaintCommentResponse,
    ComplaintStats,
)

router = APIRouter()


@router.get("", response_model=ComplaintListResponse)
async def list_complaints(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    society_id: Optional[UUID] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    escalated: Optional[bool] = None,
):
    """List all complaints with filters."""
    query = select(Complaint)
    count_query = select(func.count(Complaint.id))

    if search:
        search_filter = or_(
            Complaint.title.ilike(f"%{search}%"),
            Complaint.description.ilike(f"%{search}%"),
        )
        query = query.where(search_filter)
        count_query = count_query.where(search_filter)

    if society_id:
        query = query.where(Complaint.society_id == society_id)
        count_query = count_query.where(Complaint.society_id == society_id)

    if status:
        query = query.where(Complaint.status == status)
        count_query = count_query.where(Complaint.status == status)

    if priority:
        query = query.where(Complaint.priority == priority)
        count_query = count_query.where(Complaint.priority == priority)

    if category:
        query = query.where(Complaint.category == category)
        count_query = count_query.where(Complaint.category == category)

    if escalated is not None:
        query = query.where(Complaint.escalated == escalated)
        count_query = count_query.where(Complaint.escalated == escalated)

    total = await db.scalar(count_query)

    offset = (page - 1) * page_size
    query = query.order_by(desc(Complaint.created_at)).offset(offset).limit(page_size)
    result = await db.execute(query)
    complaints = result.scalars().all()

    # Get society and user names
    society_ids = set(c.society_id for c in complaints)
    user_ids = set()
    for c in complaints:
        if c.filed_by:
            user_ids.add(c.filed_by)
        if c.assigned_to:
            user_ids.add(c.assigned_to)

    society_map = {}
    if society_ids:
        soc_result = await db.execute(select(Society).where(Society.id.in_(society_ids)))
        for s in soc_result.scalars().all():
            society_map[s.id] = s.name

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
            society_name=society_map.get(c.society_id),
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
async def get_complaint_stats(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
):
    """Get complaint statistics."""
    total = await db.scalar(select(func.count(Complaint.id)))
    open_count = await db.scalar(
        select(func.count(Complaint.id)).where(Complaint.status == "open")
    )
    in_progress = await db.scalar(
        select(func.count(Complaint.id)).where(Complaint.status == "in_progress")
    )
    resolved = await db.scalar(
        select(func.count(Complaint.id)).where(Complaint.status == "resolved")
    )
    escalated = await db.scalar(
        select(func.count(Complaint.id)).where(Complaint.escalated == True)
    )

    # By category
    by_category = {}
    category_result = await db.execute(
        select(Complaint.category, func.count(Complaint.id)).group_by(Complaint.category)
    )
    for row in category_result:
        by_category[row[0]] = row[1]

    # By priority
    by_priority = {}
    priority_result = await db.execute(
        select(Complaint.priority, func.count(Complaint.id)).group_by(Complaint.priority)
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


@router.get("/{complaint_id}", response_model=ComplaintResponse)
async def get_complaint(
    complaint_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
):
    """Get complaint details."""
    result = await db.execute(select(Complaint).where(Complaint.id == complaint_id))
    complaint = result.scalar_one_or_none()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    # Get names
    society_name = None
    if complaint.society_id:
        soc = await db.execute(select(Society).where(Society.id == complaint.society_id))
        society = soc.scalar_one_or_none()
        if society:
            society_name = society.name

    filed_by_name = None
    if complaint.filed_by:
        user = await db.execute(select(User).where(User.id == complaint.filed_by))
        u = user.scalar_one_or_none()
        if u:
            filed_by_name = u.full_name

    assigned_to_name = None
    if complaint.assigned_to:
        user = await db.execute(select(User).where(User.id == complaint.assigned_to))
        u = user.scalar_one_or_none()
        if u:
            assigned_to_name = u.full_name

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
        society_name=society_name,
        filed_by_name=filed_by_name,
        assigned_to_name=assigned_to_name,
    )


@router.patch("/{complaint_id}", response_model=ComplaintResponse)
async def update_complaint(
    complaint_id: UUID,
    update: ComplaintUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Update a complaint."""
    result = await db.execute(select(Complaint).where(Complaint.id == complaint_id))
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

    await log_admin_action(
        db, current_user_id, current_user,
        "update_complaint", request.url.path, request.method,
        {"complaint_id": str(complaint_id), "updates": update_data},
    )

    return await get_complaint(complaint_id, db, current_user)


@router.post("/{complaint_id}/escalate", response_model=ComplaintResponse)
async def escalate_complaint(
    complaint_id: UUID,
    escalate: ComplaintEscalate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Escalate a complaint."""
    result = await db.execute(select(Complaint).where(Complaint.id == complaint_id))
    complaint = result.scalar_one_or_none()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    complaint.escalated = True
    complaint.escalated_at = datetime.utcnow()
    complaint.escalation_reason = escalate.escalation_reason
    complaint.status = "escalated"
    complaint.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(complaint)

    await log_admin_action(
        db, current_user_id, current_user,
        "escalate_complaint", request.url.path, request.method,
        {"complaint_id": str(complaint_id), "reason": escalate.escalation_reason},
    )

    return await get_complaint(complaint_id, db, current_user)


@router.get("/{complaint_id}/comments")
async def list_complaint_comments(
    complaint_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
):
    """List comments on a complaint."""
    result = await db.execute(
        select(ComplaintComment)
        .where(ComplaintComment.complaint_id == complaint_id)
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
        item = ComplaintCommentResponse(
            id=c.id,
            complaint_id=c.complaint_id,
            user_id=c.user_id,
            comment=c.comment,
            is_internal=c.is_internal,
            created_at=c.created_at,
        )
        item_dict = item.model_dump()
        item_dict["user_name"] = user_map.get(c.user_id) if c.user_id else None
        items.append(item_dict)

    return {"items": items}


@router.post("/{complaint_id}/comments", response_model=ComplaintCommentResponse)
async def add_complaint_comment(
    complaint_id: UUID,
    comment: ComplaintCommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Add a comment to a complaint."""
    # Verify complaint exists
    result = await db.execute(select(Complaint).where(Complaint.id == complaint_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Complaint not found")

    new_comment = ComplaintComment(
        complaint_id=complaint_id,
        user_id=current_user_id,
        comment=comment.comment,
        is_internal=comment.is_internal,
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
