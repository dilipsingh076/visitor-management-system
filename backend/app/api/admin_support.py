"""
Platform Admin Support Tickets API endpoints.
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
from app.models.support import SupportTicket, TicketMessage
from app.schemas.support import (
    SupportTicketCreate, SupportTicketUpdate,
    SupportTicketResponse, SupportTicketListResponse,
    TicketMessageCreate, TicketMessageResponse,
    SupportStats,
)

router = APIRouter()


def generate_ticket_number(count: int) -> str:
    """Generate a unique ticket number."""
    return f"TKT-{datetime.utcnow().strftime('%Y%m')}-{count + 1:05d}"


@router.get("", response_model=SupportTicketListResponse)
async def list_support_tickets(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    society_id: Optional[UUID] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    assigned_to: Optional[UUID] = None,
):
    """List all support tickets with filters."""
    query = select(SupportTicket)
    count_query = select(func.count(SupportTicket.id))

    if search:
        search_filter = or_(
            SupportTicket.subject.ilike(f"%{search}%"),
            SupportTicket.description.ilike(f"%{search}%"),
            SupportTicket.ticket_number.ilike(f"%{search}%"),
        )
        query = query.where(search_filter)
        count_query = count_query.where(search_filter)

    if society_id:
        query = query.where(SupportTicket.society_id == society_id)
        count_query = count_query.where(SupportTicket.society_id == society_id)

    if status:
        query = query.where(SupportTicket.status == status)
        count_query = count_query.where(SupportTicket.status == status)

    if priority:
        query = query.where(SupportTicket.priority == priority)
        count_query = count_query.where(SupportTicket.priority == priority)

    if category:
        query = query.where(SupportTicket.category == category)
        count_query = count_query.where(SupportTicket.category == category)

    if assigned_to:
        query = query.where(SupportTicket.assigned_to == assigned_to)
        count_query = count_query.where(SupportTicket.assigned_to == assigned_to)

    total = await db.scalar(count_query)

    offset = (page - 1) * page_size
    query = query.order_by(desc(SupportTicket.created_at)).offset(offset).limit(page_size)
    result = await db.execute(query)
    tickets = result.scalars().all()

    # Get society and user names
    society_ids = set(t.society_id for t in tickets if t.society_id)
    user_ids = set()
    for t in tickets:
        if t.user_id:
            user_ids.add(t.user_id)
        if t.assigned_to:
            user_ids.add(t.assigned_to)

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
    for t in tickets:
        item = SupportTicketResponse(
            id=t.id,
            ticket_number=t.ticket_number,
            society_id=t.society_id,
            user_id=t.user_id,
            assigned_to=t.assigned_to,
            subject=t.subject,
            description=t.description,
            category=t.category,
            priority=t.priority,
            status=t.status,
            resolved_at=t.resolved_at,
            resolved_by=t.resolved_by,
            resolution_notes=t.resolution_notes,
            contact_email=t.contact_email,
            contact_phone=t.contact_phone,
            created_at=t.created_at,
            updated_at=t.updated_at,
            society_name=society_map.get(t.society_id) if t.society_id else None,
            user_name=user_map.get(t.user_id) if t.user_id else None,
            assigned_to_name=user_map.get(t.assigned_to) if t.assigned_to else None,
        )
        items.append(item)

    return SupportTicketListResponse(
        items=items,
        total=total or 0,
        page=page,
        page_size=page_size,
        total_pages=(total or 0 + page_size - 1) // page_size if total else 0,
    )


@router.get("/stats", response_model=SupportStats)
async def get_support_stats(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
):
    """Get support ticket statistics."""
    total = await db.scalar(select(func.count(SupportTicket.id)))
    open_count = await db.scalar(
        select(func.count(SupportTicket.id)).where(SupportTicket.status == "open")
    )
    in_progress = await db.scalar(
        select(func.count(SupportTicket.id)).where(SupportTicket.status == "in_progress")
    )
    resolved = await db.scalar(
        select(func.count(SupportTicket.id)).where(SupportTicket.status == "resolved")
    )

    # By category
    by_category = {}
    category_result = await db.execute(
        select(SupportTicket.category, func.count(SupportTicket.id)).group_by(SupportTicket.category)
    )
    for row in category_result:
        by_category[row[0]] = row[1]

    # By priority
    by_priority = {}
    priority_result = await db.execute(
        select(SupportTicket.priority, func.count(SupportTicket.id)).group_by(SupportTicket.priority)
    )
    for row in priority_result:
        by_priority[row[0]] = row[1]

    return SupportStats(
        total=total or 0,
        open=open_count or 0,
        in_progress=in_progress or 0,
        resolved=resolved or 0,
        by_category=by_category,
        by_priority=by_priority,
        avg_resolution_time_hours=None,
    )


@router.get("/{ticket_id}", response_model=SupportTicketResponse)
async def get_support_ticket(
    ticket_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
):
    """Get support ticket details with messages."""
    result = await db.execute(select(SupportTicket).where(SupportTicket.id == ticket_id))
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Get names
    society_name = None
    if ticket.society_id:
        soc = await db.execute(select(Society).where(Society.id == ticket.society_id))
        society = soc.scalar_one_or_none()
        if society:
            society_name = society.name

    user_name = None
    if ticket.user_id:
        user = await db.execute(select(User).where(User.id == ticket.user_id))
        u = user.scalar_one_or_none()
        if u:
            user_name = u.full_name

    assigned_to_name = None
    if ticket.assigned_to:
        user = await db.execute(select(User).where(User.id == ticket.assigned_to))
        u = user.scalar_one_or_none()
        if u:
            assigned_to_name = u.full_name

    # Get messages
    messages_result = await db.execute(
        select(TicketMessage)
        .where(TicketMessage.ticket_id == ticket_id)
        .order_by(TicketMessage.created_at)
    )
    messages = messages_result.scalars().all()

    # Get message user names
    msg_user_ids = set(m.user_id for m in messages if m.user_id)
    msg_user_map = {}
    if msg_user_ids:
        msg_user_result = await db.execute(select(User).where(User.id.in_(msg_user_ids)))
        for u in msg_user_result.scalars().all():
            msg_user_map[u.id] = u.full_name

    message_responses = []
    for m in messages:
        message_responses.append(TicketMessageResponse(
            id=m.id,
            ticket_id=m.ticket_id,
            user_id=m.user_id,
            message=m.message,
            is_staff_reply=m.is_staff_reply,
            attachments=m.attachments,
            created_at=m.created_at,
            user_name=msg_user_map.get(m.user_id) if m.user_id else None,
        ))

    return SupportTicketResponse(
        id=ticket.id,
        ticket_number=ticket.ticket_number,
        society_id=ticket.society_id,
        user_id=ticket.user_id,
        assigned_to=ticket.assigned_to,
        subject=ticket.subject,
        description=ticket.description,
        category=ticket.category,
        priority=ticket.priority,
        status=ticket.status,
        resolved_at=ticket.resolved_at,
        resolved_by=ticket.resolved_by,
        resolution_notes=ticket.resolution_notes,
        contact_email=ticket.contact_email,
        contact_phone=ticket.contact_phone,
        created_at=ticket.created_at,
        updated_at=ticket.updated_at,
        society_name=society_name,
        user_name=user_name,
        assigned_to_name=assigned_to_name,
        messages=message_responses,
    )


@router.patch("/{ticket_id}", response_model=SupportTicketResponse)
async def update_support_ticket(
    ticket_id: UUID,
    update: SupportTicketUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Update a support ticket."""
    result = await db.execute(select(SupportTicket).where(SupportTicket.id == ticket_id))
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    update_data = update.model_dump(exclude_unset=True)

    # Handle resolution
    if update_data.get("status") == "resolved" and ticket.status != "resolved":
        update_data["resolved_at"] = datetime.utcnow()
        update_data["resolved_by"] = current_user_id

    for key, value in update_data.items():
        setattr(ticket, key, value)
    ticket.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(ticket)

    await log_admin_action(
        db, current_user_id, current_user,
        "update_support_ticket", request.url.path, request.method,
        {"ticket_id": str(ticket_id), "updates": update_data},
    )

    return await get_support_ticket(ticket_id, db, current_user)


@router.post("/{ticket_id}/messages", response_model=TicketMessageResponse)
async def add_ticket_message(
    ticket_id: UUID,
    message: TicketMessageCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Add a message to a support ticket (staff reply)."""
    # Verify ticket exists
    result = await db.execute(select(SupportTicket).where(SupportTicket.id == ticket_id))
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    new_message = TicketMessage(
        ticket_id=ticket_id,
        user_id=current_user_id,
        message=message.message,
        is_staff_reply=True,
        attachments=message.attachments,
    )
    db.add(new_message)

    # Update ticket status if it was waiting on customer
    if ticket.status == "waiting_on_customer":
        ticket.status = "in_progress"
        ticket.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(new_message)

    # Get user name
    user_name = None
    user_result = await db.execute(select(User).where(User.id == current_user_id))
    user = user_result.scalar_one_or_none()
    if user:
        user_name = user.full_name

    return TicketMessageResponse(
        id=new_message.id,
        ticket_id=new_message.ticket_id,
        user_id=new_message.user_id,
        message=new_message.message,
        is_staff_reply=new_message.is_staff_reply,
        attachments=new_message.attachments,
        created_at=new_message.created_at,
        user_name=user_name,
    )


@router.post("/{ticket_id}/close")
async def close_ticket(
    ticket_id: UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Close a support ticket."""
    result = await db.execute(select(SupportTicket).where(SupportTicket.id == ticket_id))
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket.status = "closed"
    ticket.updated_at = datetime.utcnow()
    await db.commit()

    await log_admin_action(
        db, current_user_id, current_user,
        "close_support_ticket", request.url.path, request.method,
        {"ticket_id": str(ticket_id)},
    )

    return {"message": "Ticket closed", "ticket_id": str(ticket_id)}
