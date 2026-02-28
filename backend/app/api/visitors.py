"""Visitor & Visit management endpoints. RBAC: resident/admin for invite/approve; guard/admin for walk-in."""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.dependencies import (
    get_db,
    get_current_user,
    get_current_user_id,
    get_current_resident_or_admin,
    get_current_guard_or_admin,
    get_current_any_role,
)
from app.core.rbac import is_admin, is_guard_or_admin, log_admin_action
from app.db.seed import ensure_demo_user, ensure_demo_users
from app.schemas.visitor import VisitCreate, WalkInCreate
from app.schemas.checkin import CheckInResponse
from app.services.visit_service import (
    create_invitation,
    create_walkin_visit,
    get_visit_by_id,
    get_resident_by_building_and_flat,
    ensure_user_in_society,
    ensure_building_in_society,
    list_visits,
    approve_visit,
)
from app.models.visitor import Visit

router = APIRouter()


def _visit_to_response(v: Visit) -> dict:
    """Convert Visit model to response dict."""
    host_name = v.host.full_name if v.host else ""
    is_walkin = (v.extra_data or {}).get("walkin", False)
    return {
        "id": str(v.id),
        "visitor_id": str(v.visitor_id),
        "host_id": str(v.host_id),
        "host_name": host_name,
        "is_walkin": is_walkin,
        "status": v.status.value if hasattr(v.status, "value") else v.status,
        "purpose": v.purpose,
        "visitor_name": v.visitor.full_name,
        "visitor_phone": v.visitor.phone,
        "expected_arrival": v.expected_arrival.isoformat() if v.expected_arrival else None,
        "actual_arrival": v.actual_arrival.isoformat() if v.actual_arrival else None,
        "actual_departure": v.actual_departure.isoformat() if v.actual_departure else None,
        "qr_code": v.qr_code,
        "otp": v.otp,
        "consent_given": v.consent_given,
        "created_at": v.created_at.isoformat(),
        "updated_at": v.updated_at.isoformat(),
    }


@router.post("/invite")
async def invite_visitor(
    request: Request,
    visit_data: VisitCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_resident_or_admin),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Resident or admin invites a visitor (creates pre-approval with QR & OTP). Host is current user."""
    await ensure_demo_users(db)
    try:
        visit = await create_invitation(
            db=db,
            host_id=current_user_id,
            visitor_phone=visit_data.visitor_phone,
            visitor_name=visit_data.visitor_name,
            visitor_email=visit_data.visitor_email,
            purpose=visit_data.purpose,
            expected_arrival=visit_data.expected_arrival,
        )
        await db.refresh(visit, ["visitor"])

        await log_admin_action(
            db, current_user_id, current_user,
            "invite_visitor", request.url.path, request.method,
            {"visit_id": str(visit.id), "visitor_phone": visit_data.visitor_phone},
        )

        from app.services.waha_service import send_invite_whatsapp
        await send_invite_whatsapp(
            visit_data.visitor_phone,
            visit_data.visitor_name,
            visit.otp or "",
            visit.qr_code,
        )

        return _visit_to_response(visit)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/walkin")
async def walkin_visitor(
    request: Request,
    data: WalkInCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_guard_or_admin),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """
    Guard registers walk-in visitor. Resident is identified by host_id OR by building_id + flat_number (tower + flat).
    Notification is sent to that resident's device (in-app; push when implemented). No OTP for visitor.
    """
    await ensure_demo_user(db)
    try:
        society_id = current_user.get("society_id")
        if not society_id:
            raise ValueError("You must be assigned to a society to register walk-ins")
        try:
            sid = UUID(society_id)
        except (ValueError, TypeError):
            raise ValueError("Invalid society")

        host_id: UUID
        building_name: str | None = None
        flat_number: str | None = None

        if data.host_id is not None:
            await ensure_user_in_society(db, data.host_id, sid)
            host_id = data.host_id
        else:
            if not data.building_id or not data.flat_number:
                raise ValueError("Provide either host_id or both building_id and flat_number")
            await ensure_building_in_society(db, data.building_id, sid)
            resident = await get_resident_by_building_and_flat(
                db, sid, data.building_id, data.flat_number
            )
            if not resident:
                raise ValueError(
                    "No resident found for this tower and flat. Check building and flat number."
                )
            host_id = resident.id
            flat_number = (data.flat_number or "").strip()
            if resident.building:
                building_name = resident.building.name
            else:
                building_name = None

        if data.host_id is not None and (building_name is None and flat_number is None):
            from app.models.user import User
            res = await db.execute(
                select(User).options(selectinload(User.building)).where(User.id == host_id)
            )
            host_user = res.scalar_one_or_none()
            if host_user:
                building_name = host_user.building.name if host_user.building else None
                flat_number = (host_user.flat_number or "").strip() or None

        visit = await create_walkin_visit(
            db=db,
            host_id=host_id,
            visitor_phone=data.visitor_phone,
            visitor_name=data.visitor_name,
            purpose=data.purpose,
            guard_id=current_user_id,
            building_name=building_name,
            flat_number=flat_number,
        )
        await db.refresh(visit, ["visitor", "host"])
        await log_admin_action(
            db, current_user_id, current_user,
            "walkin_visitor", request.url.path, request.method,
            {"visit_id": str(visit.id), "host_id": str(host_id)},
        )
        return _visit_to_response(visit)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/")
async def list_visits_api(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_any_role),
    current_user_id: UUID = Depends(get_current_user_id),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    status: str | None = Query(None),
    host_id: str | None = Query(None, description="Filter by host. Use 'me' for current user's visits."),
):
    """
    List visits. Residents see only their own (host_id=me enforced).
    Guard/admin may pass host_id or list all.
    """
    hid = None
    if host_id == "me":
        hid = current_user_id
    elif host_id:
        if not is_guard_or_admin(current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized. Residents may only list own visits (host_id=me).",
            )
        try:
            hid = UUID(host_id)
        except ValueError:
            pass
    elif not is_guard_or_admin(current_user):
        hid = current_user_id
    society_id = current_user.get("society_id")
    try:
        sid = UUID(society_id) if society_id else None
    except (ValueError, TypeError):
        sid = None
    visits = await list_visits(db, limit=limit, offset=offset, status=status, host_id=hid, society_id=sid)
    return [_visit_to_response(v) for v in visits]


@router.patch("/{visit_id}/approve")
async def approve_visit_api(
    request: Request,
    visit_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_resident_or_admin),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Resident or admin approves a pending visit (ownership: only the host may approve unless admin)."""
    visit = await get_visit_by_id(db, visit_id)
    if not visit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Visit not found")
    if not is_admin(current_user) and visit.host_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to approve this visit. Only the host may approve.",
        )
    if current_user.get("society_id") and visit.host and str(visit.host.society_id) != current_user.get("society_id"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Visit does not belong to your society")
    try:
        visit = await approve_visit(db, visit)
        await db.refresh(visit, ["visitor"])
        await log_admin_action(
            db, current_user_id, current_user,
            "approve_visit", request.url.path, request.method,
            {"visit_id": str(visit_id)},
        )
        return _visit_to_response(visit)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{visit_id}")
async def get_visit(
    visit_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_any_role),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Get visit by ID. Residents may only access their own visits (host_id); guard/admin may access any."""
    visit = await get_visit_by_id(db, visit_id)
    if not visit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Visit not found")
    if not is_guard_or_admin(current_user) and visit.host_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this visit.",
        )
    if is_guard_or_admin(current_user) and current_user.get("society_id") and visit.host and str(visit.host.society_id) != current_user.get("society_id"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Visit does not belong to your society")
    return _visit_to_response(visit)
