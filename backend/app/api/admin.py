"""
Platform Admin API endpoints.
RBAC: All endpoints require platform_admin role.
"""
from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc
from sqlalchemy.orm import selectinload
from typing import Optional, List
from datetime import datetime, timedelta
from uuid import UUID
from decimal import Decimal
import secrets

from app.core.dependencies import get_db, get_current_user, get_current_user_id
from app.core.rbac import log_admin_action
from app.core.roles import ROLE_PLATFORM_ADMIN, roles_include_platform_admin
from app.core.security import hash_password
from app.models import (
    Society, Building, User, Visitor, Visit,
    AuditLog, Notification,
)
from app.models.subscription import SubscriptionPlan, Subscription, Payment, Invoice
from app.models.complaint import Complaint, ComplaintComment
from app.models.support import SupportTicket, TicketMessage
from app.models.platform import PlatformAnnouncement, SystemSetting, ActivityLog
from app.schemas.platform import (
    PlatformDashboardStats, PlatformDashboardResponse,
    AuditLogResponse, AuditLogListResponse,
    GlobalUserResponse, GlobalUserListResponse, GlobalUserUpdate, ResetPasswordRequest,
    SocietyDetailResponse, SocietyUpdate, SocietyListResponse, AssignAdminRequest,
    AnnouncementCreate, AnnouncementUpdate, AnnouncementResponse,
    SystemSettingUpdate, SystemSettingResponse,
)
from app.schemas.subscription import (
    SubscriptionPlanCreate, SubscriptionPlanUpdate, SubscriptionPlanResponse,
    SubscriptionCreate, SubscriptionUpdate, SubscriptionResponse,
    PaymentResponse, InvoiceResponse,
)
from app.schemas.complaint import (
    ComplaintResponse, ComplaintListResponse, ComplaintUpdate, ComplaintEscalate, ComplaintStats,
)
from app.schemas.support import (
    SupportTicketResponse, SupportTicketListResponse, SupportTicketUpdate,
    TicketMessageCreate, TicketMessageResponse, SupportStats,
)

router = APIRouter()


def require_platform_admin(current_user: dict = Depends(get_current_user)):
    """Dependency to require platform admin role."""
    roles = current_user.get("realm_access", {}).get("roles", [])
    if not roles_include_platform_admin(roles):
        raise HTTPException(status_code=403, detail="Platform admin access required")
    return current_user


# ============== Dashboard ==============

@router.get("/dashboard", response_model=PlatformDashboardResponse)
async def get_platform_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
):
    """Get platform-wide dashboard statistics."""
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # Total societies
    total_societies = await db.scalar(select(func.count(Society.id)))
    active_societies = await db.scalar(
        select(func.count(Society.id)).where(Society.is_active == True)
    )

    # Total residents
    total_residents = await db.scalar(
        select(func.count(User.id)).where(User.role == "resident")
    )

    # Visitors today/month
    total_visitors_today = await db.scalar(
        select(func.count(Visit.id)).where(Visit.created_at >= today_start)
    )
    total_visitors_month = await db.scalar(
        select(func.count(Visit.id)).where(Visit.created_at >= month_start)
    )

    # Complaints
    total_complaints = await db.scalar(select(func.count(Complaint.id)))
    open_complaints = await db.scalar(
        select(func.count(Complaint.id)).where(Complaint.status.in_(["open", "in_progress"]))
    )

    # Support tickets
    total_support_tickets = await db.scalar(select(func.count(SupportTicket.id)))
    open_support_tickets = await db.scalar(
        select(func.count(SupportTicket.id)).where(SupportTicket.status.in_(["open", "in_progress"]))
    )

    # Revenue (placeholder - actual implementation would sum payments)
    total_revenue = Decimal("0")
    revenue_this_month = Decimal("0")
    try:
        total_revenue_result = await db.scalar(
            select(func.sum(Payment.amount)).where(Payment.status == "completed")
        )
        total_revenue = Decimal(str(total_revenue_result or 0))
        
        revenue_month_result = await db.scalar(
            select(func.sum(Payment.amount)).where(
                and_(Payment.status == "completed", Payment.created_at >= month_start)
            )
        )
        revenue_this_month = Decimal(str(revenue_month_result or 0))
    except Exception:
        pass

    # Active subscriptions
    active_subscriptions = await db.scalar(
        select(func.count(Subscription.id)).where(Subscription.status == "active")
    )

    stats = PlatformDashboardStats(
        total_societies=total_societies or 0,
        active_societies=active_societies or 0,
        total_residents=total_residents or 0,
        total_visitors_today=total_visitors_today or 0,
        total_visitors_month=total_visitors_month or 0,
        total_complaints=total_complaints or 0,
        open_complaints=open_complaints or 0,
        total_support_tickets=total_support_tickets or 0,
        open_support_tickets=open_support_tickets or 0,
        total_revenue=total_revenue,
        revenue_this_month=revenue_this_month,
        active_subscriptions=active_subscriptions or 0,
    )

    # Society growth (last 30 days)
    society_growth = []
    for i in range(30, -1, -1):
        day = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        count = await db.scalar(
            select(func.count(Society.id)).where(Society.created_at <= day)
        )
        society_growth.append({"date": day.strftime("%Y-%m-%d"), "count": count or 0})

    # Revenue trend (last 12 months - placeholder)
    revenue_trend = []
    for i in range(11, -1, -1):
        month_date = (now - timedelta(days=30 * i)).replace(day=1)
        revenue_trend.append({"date": month_date.strftime("%Y-%m"), "amount": Decimal("0")})

    # Recent activity
    recent_activity = []
    try:
        activity_result = await db.execute(
            select(ActivityLog)
            .order_by(desc(ActivityLog.created_at))
            .limit(20)
        )
        activities = activity_result.scalars().all()
        for act in activities:
            recent_activity.append({
                "id": act.id,
                "activity_type": act.activity_type,
                "description": act.description or "",
                "user_name": None,
                "society_name": None,
                "created_at": act.created_at,
            })
    except Exception:
        pass

    # Top societies by visitors
    top_societies = []
    try:
        result = await db.execute(
            select(Society.id, Society.name, func.count(Visit.id).label("visit_count"))
            .outerjoin(User, User.society_id == Society.id)
            .outerjoin(Visit, Visit.host_id == User.id)
            .group_by(Society.id, Society.name)
            .order_by(desc("visit_count"))
            .limit(5)
        )
        for row in result:
            top_societies.append({
                "id": str(row.id),
                "name": row.name,
                "visit_count": row.visit_count or 0,
            })
    except Exception:
        pass

    # Complaint breakdown by category
    complaint_breakdown = {}
    try:
        result = await db.execute(
            select(Complaint.category, func.count(Complaint.id))
            .group_by(Complaint.category)
        )
        for row in result:
            complaint_breakdown[row[0]] = row[1]
    except Exception:
        pass

    return PlatformDashboardResponse(
        stats=stats,
        society_growth=society_growth,
        revenue_trend=revenue_trend,
        recent_activity=recent_activity,
        top_societies=top_societies,
        complaint_breakdown=complaint_breakdown,
    )


# ============== Societies ==============

@router.get("/societies", response_model=SocietyListResponse)
async def list_all_societies(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    is_active: Optional[bool] = None,
):
    """List all societies with filters and pagination."""
    query = select(Society)
    count_query = select(func.count(Society.id))

    # Apply filters
    if search:
        search_filter = or_(
            Society.name.ilike(f"%{search}%"),
            Society.slug.ilike(f"%{search}%"),
            Society.city.ilike(f"%{search}%"),
            Society.contact_email.ilike(f"%{search}%"),
        )
        query = query.where(search_filter)
        count_query = count_query.where(search_filter)

    if status:
        query = query.where(Society.status == status)
        count_query = count_query.where(Society.status == status)

    if is_active is not None:
        query = query.where(Society.is_active == is_active)
        count_query = count_query.where(Society.is_active == is_active)

    # Get total count
    total = await db.scalar(count_query)

    # Paginate
    offset = (page - 1) * page_size
    query = query.order_by(desc(Society.created_at)).offset(offset).limit(page_size)
    result = await db.execute(query)
    societies = result.scalars().all()

    # Enrich with stats
    items = []
    for s in societies:
        # Get building count
        building_count = await db.scalar(
            select(func.count(Building.id)).where(Building.society_id == s.id)
        )
        # Get resident count
        resident_count = await db.scalar(
            select(func.count(User.id)).where(User.society_id == s.id)
        )
        items.append(SocietyDetailResponse(
            id=s.id,
            name=s.name,
            slug=s.slug,
            address=s.address,
            city=s.city,
            state=s.state,
            pincode=s.pincode,
            country=s.country,
            contact_email=s.contact_email,
            contact_phone=s.contact_phone,
            registration_number=s.registration_number,
            society_type=s.society_type,
            plan=s.plan,
            status=s.status,
            is_active=s.is_active,
            created_at=s.created_at,
            updated_at=s.updated_at,
            total_buildings=building_count or 0,
            total_residents=resident_count or 0,
        ))

    return SocietyListResponse(
        items=items,
        total=total or 0,
        page=page,
        page_size=page_size,
        total_pages=(total or 0 + page_size - 1) // page_size if total else 0,
    )


@router.get("/societies/{society_id}", response_model=SocietyDetailResponse)
async def get_society_detail(
    society_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
):
    """Get detailed society information."""
    result = await db.execute(select(Society).where(Society.id == society_id))
    society = result.scalar_one_or_none()
    if not society:
        raise HTTPException(status_code=404, detail="Society not found")

    # Get stats
    building_count = await db.scalar(
        select(func.count(Building.id)).where(Building.society_id == society.id)
    )
    resident_count = await db.scalar(
        select(func.count(User.id)).where(User.society_id == society.id)
    )

    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    visitors_today = await db.scalar(
        select(func.count(Visit.id))
        .join(User, Visit.host_id == User.id)
        .where(and_(User.society_id == society.id, Visit.created_at >= today_start))
    )
    visitors_month = await db.scalar(
        select(func.count(Visit.id))
        .join(User, Visit.host_id == User.id)
        .where(and_(User.society_id == society.id, Visit.created_at >= month_start))
    )

    return SocietyDetailResponse(
        id=society.id,
        name=society.name,
        slug=society.slug,
        address=society.address,
        city=society.city,
        state=society.state,
        pincode=society.pincode,
        country=society.country,
        contact_email=society.contact_email,
        contact_phone=society.contact_phone,
        registration_number=society.registration_number,
        society_type=society.society_type,
        plan=society.plan,
        status=society.status,
        is_active=society.is_active,
        created_at=society.created_at,
        updated_at=society.updated_at,
        total_buildings=building_count or 0,
        total_residents=resident_count or 0,
        total_visitors_today=visitors_today or 0,
        total_visitors_month=visitors_month or 0,
    )


@router.patch("/societies/{society_id}", response_model=SocietyDetailResponse)
async def update_society(
    society_id: UUID,
    update: SocietyUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Update society details."""
    result = await db.execute(select(Society).where(Society.id == society_id))
    society = result.scalar_one_or_none()
    if not society:
        raise HTTPException(status_code=404, detail="Society not found")

    update_data = update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(society, key, value)

    society.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(society)

    await log_admin_action(
        db, current_user_id, current_user,
        "update_society", request.url.path, request.method,
        {"society_id": str(society_id), "updates": update_data},
    )

    return await get_society_detail(society_id, db, current_user)


@router.post("/societies/{society_id}/activate")
async def activate_society(
    society_id: UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Activate a society."""
    result = await db.execute(select(Society).where(Society.id == society_id))
    society = result.scalar_one_or_none()
    if not society:
        raise HTTPException(status_code=404, detail="Society not found")

    society.is_active = True
    society.status = "active"
    society.updated_at = datetime.utcnow()
    await db.commit()

    await log_admin_action(
        db, current_user_id, current_user,
        "activate_society", request.url.path, request.method,
        {"society_id": str(society_id)},
    )

    return {"message": "Society activated", "society_id": str(society_id)}


@router.post("/societies/{society_id}/deactivate")
async def deactivate_society(
    society_id: UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Deactivate a society."""
    result = await db.execute(select(Society).where(Society.id == society_id))
    society = result.scalar_one_or_none()
    if not society:
        raise HTTPException(status_code=404, detail="Society not found")

    society.is_active = False
    society.status = "inactive"
    society.updated_at = datetime.utcnow()
    await db.commit()

    await log_admin_action(
        db, current_user_id, current_user,
        "deactivate_society", request.url.path, request.method,
        {"society_id": str(society_id)},
    )

    return {"message": "Society deactivated", "society_id": str(society_id)}


@router.post("/societies/{society_id}/assign-admin")
async def assign_society_admin(
    society_id: UUID,
    assign: AssignAdminRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Assign an admin to a society."""
    result = await db.execute(select(Society).where(Society.id == society_id))
    society = result.scalar_one_or_none()
    if not society:
        raise HTTPException(status_code=404, detail="Society not found")

    if assign.user_id:
        # Assign existing user
        user_result = await db.execute(select(User).where(User.id == assign.user_id))
        user = user_result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user.society_id = society_id
        user.role = assign.role
        user.roles = [assign.role]
        await db.commit()
        admin_id = user.id
    elif assign.email:
        # Create new user as admin
        existing = await db.execute(select(User).where(User.email == assign.email))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="User with this email already exists")

        temp_password = secrets.token_urlsafe(12)
        new_user = User(
            email=assign.email,
            full_name=assign.full_name or "Admin",
            phone=assign.phone,
            role=assign.role,
            roles=[assign.role],
            society_id=society_id,
            password_hash=hash_password(temp_password),
            is_active=True,
            is_verified=True,
        )
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        admin_id = new_user.id
    else:
        raise HTTPException(status_code=400, detail="Provide either user_id or email")

    await log_admin_action(
        db, current_user_id, current_user,
        "assign_society_admin", request.url.path, request.method,
        {"society_id": str(society_id), "admin_id": str(admin_id), "role": assign.role},
    )

    return {"message": "Admin assigned", "society_id": str(society_id), "admin_id": str(admin_id)}


# ============== Global Users ==============

@router.get("/users", response_model=GlobalUserListResponse)
async def list_all_users(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    society_id: Optional[UUID] = None,
):
    """List all users across all societies."""
    query = select(User)
    count_query = select(func.count(User.id))

    if search:
        search_filter = or_(
            User.full_name.ilike(f"%{search}%"),
            User.email.ilike(f"%{search}%"),
            User.phone.ilike(f"%{search}%"),
        )
        query = query.where(search_filter)
        count_query = count_query.where(search_filter)

    if role:
        query = query.where(User.role == role)
        count_query = count_query.where(User.role == role)

    if is_active is not None:
        query = query.where(User.is_active == is_active)
        count_query = count_query.where(User.is_active == is_active)

    if society_id:
        query = query.where(User.society_id == society_id)
        count_query = count_query.where(User.society_id == society_id)

    total = await db.scalar(count_query)

    offset = (page - 1) * page_size
    query = query.order_by(desc(User.created_at)).offset(offset).limit(page_size)
    result = await db.execute(query)
    users = result.scalars().all()

    # Build society cache
    society_ids = set(u.society_id for u in users if u.society_id)
    society_map = {}
    if society_ids:
        soc_result = await db.execute(select(Society).where(Society.id.in_(society_ids)))
        for s in soc_result.scalars().all():
            society_map[s.id] = s.name

    items = []
    for u in users:
        items.append(GlobalUserResponse(
            id=u.id,
            email=u.email,
            phone=u.phone,
            full_name=u.full_name,
            flat_number=u.flat_number,
            is_active=u.is_active,
            is_verified=u.is_verified,
            role=u.role,
            roles=u.roles,
            society_id=u.society_id,
            building_id=u.building_id,
            last_login=u.last_login,
            created_at=u.created_at,
            society_name=society_map.get(u.society_id),
        ))

    return GlobalUserListResponse(
        items=items,
        total=total or 0,
        page=page,
        page_size=page_size,
        total_pages=(total or 0 + page_size - 1) // page_size if total else 0,
    )


@router.get("/users/{user_id}", response_model=GlobalUserResponse)
async def get_user_detail(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
):
    """Get user details."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    society_name = None
    if user.society_id:
        soc = await db.execute(select(Society).where(Society.id == user.society_id))
        society = soc.scalar_one_or_none()
        if society:
            society_name = society.name

    return GlobalUserResponse(
        id=user.id,
        email=user.email,
        phone=user.phone,
        full_name=user.full_name,
        flat_number=user.flat_number,
        is_active=user.is_active,
        is_verified=user.is_verified,
        role=user.role,
        roles=user.roles,
        society_id=user.society_id,
        building_id=user.building_id,
        last_login=user.last_login,
        created_at=user.created_at,
        society_name=society_name,
    )


@router.patch("/users/{user_id}", response_model=GlobalUserResponse)
async def update_user(
    user_id: UUID,
    update: GlobalUserUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Update user details (block/unblock, change role, verify)."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)

    user.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(user)

    await log_admin_action(
        db, current_user_id, current_user,
        "update_user", request.url.path, request.method,
        {"user_id": str(user_id), "updates": update_data},
    )

    return await get_user_detail(user_id, db, current_user)


@router.post("/users/{user_id}/block")
async def block_user(
    user_id: UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Block a user."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = False
    user.updated_at = datetime.utcnow()
    await db.commit()

    await log_admin_action(
        db, current_user_id, current_user,
        "block_user", request.url.path, request.method,
        {"user_id": str(user_id)},
    )

    return {"message": "User blocked", "user_id": str(user_id)}


@router.post("/users/{user_id}/unblock")
async def unblock_user(
    user_id: UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Unblock a user."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = True
    user.updated_at = datetime.utcnow()
    await db.commit()

    await log_admin_action(
        db, current_user_id, current_user,
        "unblock_user", request.url.path, request.method,
        {"user_id": str(user_id)},
    )

    return {"message": "User unblocked", "user_id": str(user_id)}


@router.post("/users/{user_id}/reset-password")
async def reset_user_password(
    user_id: UUID,
    reset: ResetPasswordRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Reset a user's password."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.password_hash = hash_password(reset.new_password)
    user.updated_at = datetime.utcnow()
    await db.commit()

    await log_admin_action(
        db, current_user_id, current_user,
        "reset_password", request.url.path, request.method,
        {"user_id": str(user_id)},
    )

    return {"message": "Password reset successfully", "user_id": str(user_id)}


@router.post("/users/{user_id}/verify")
async def verify_user(
    user_id: UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Verify a user (mark as verified)."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_verified = True
    user.updated_at = datetime.utcnow()
    await db.commit()

    await log_admin_action(
        db, current_user_id, current_user,
        "verify_user", request.url.path, request.method,
        {"user_id": str(user_id)},
    )

    return {"message": "User verified", "user_id": str(user_id)}


# ============== Audit Logs ==============

@router.get("/audit-logs", response_model=AuditLogListResponse)
async def list_audit_logs(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    user_id: Optional[UUID] = None,
    action: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
):
    """List audit logs with filters."""
    query = select(AuditLog)
    count_query = select(func.count(AuditLog.id))

    if user_id:
        query = query.where(AuditLog.user_id == user_id)
        count_query = count_query.where(AuditLog.user_id == user_id)

    if action:
        query = query.where(AuditLog.action.ilike(f"%{action}%"))
        count_query = count_query.where(AuditLog.action.ilike(f"%{action}%"))

    if start_date:
        query = query.where(AuditLog.created_at >= start_date)
        count_query = count_query.where(AuditLog.created_at >= start_date)

    if end_date:
        query = query.where(AuditLog.created_at <= end_date)
        count_query = count_query.where(AuditLog.created_at <= end_date)

    total = await db.scalar(count_query)

    offset = (page - 1) * page_size
    query = query.order_by(desc(AuditLog.created_at)).offset(offset).limit(page_size)
    result = await db.execute(query)
    logs = result.scalars().all()

    # Get user names
    user_ids = set(l.user_id for l in logs if l.user_id)
    user_map = {}
    if user_ids:
        user_result = await db.execute(select(User).where(User.id.in_(user_ids)))
        for u in user_result.scalars().all():
            user_map[u.id] = {"name": u.full_name, "email": u.email}

    items = []
    for log in logs:
        user_info = user_map.get(log.user_id, {})
        items.append(AuditLogResponse(
            id=log.id,
            user_id=log.user_id,
            action=log.action,
            endpoint=log.endpoint,
            request_method=log.request_method,
            details=log.details,
            created_at=log.created_at,
            user_name=user_info.get("name"),
            user_email=user_info.get("email"),
        ))

    return AuditLogListResponse(
        items=items,
        total=total or 0,
        page=page,
        page_size=page_size,
        total_pages=(total or 0 + page_size - 1) // page_size if total else 0,
    )
