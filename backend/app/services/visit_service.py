"""Visit & Visitor business logic."""
import json
import secrets
import uuid
from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.constants.visit import OTP_EXPIRE_MINUTES, OTP_LENGTH, QR_PREFIX, ARRIVAL_WINDOW_MINUTES
from app.models.visitor import Visit, VisitStatus, Visitor, ConsentLog
from app.models.user import User
from app.models.notification import Notification
from app.models.society import Building
from app.services.blacklist_service import is_visitor_blacklisted_for_society


async def ensure_user_in_society(
    db: AsyncSession, user_id: UUID, society_id: UUID
) -> User:
    """Raise ValueError if user is not in the given society (strict society scoping)."""
    result = await db.execute(
        select(User).where(User.id == user_id, User.society_id == society_id)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise ValueError("Resident not found or does not belong to your society")
    return user


async def ensure_building_in_society(
    db: AsyncSession, building_id: UUID, society_id: UUID
) -> None:
    """Raise ValueError if building is not in the given society (strict society scoping)."""
    result = await db.execute(
        select(Building).where(
            Building.id == building_id,
            Building.society_id == society_id,
        )
    )
    if not result.scalar_one_or_none():
        raise ValueError("Building (tower) not found or does not belong to your society")


async def get_resident_by_building_and_flat(
    db: AsyncSession,
    society_id: UUID,
    building_id: UUID,
    flat_number: str,
) -> Optional[User]:
    """Find resident (host) by tower/building and flat number within a society. Returns first match."""
    flat_clean = (flat_number or "").strip()
    if not flat_clean:
        return None
    result = await db.execute(
        select(User)
        .options(selectinload(User.building))
        .where(
            User.society_id == society_id,
            User.building_id == building_id,
            User.flat_number.ilike(flat_clean),
            User.role.in_(["resident", "admin"]),
            User.is_active == True,
        )
        .limit(1)
    )
    return result.scalar_one_or_none()


def _generate_otp() -> str:
    return "".join(secrets.choice("0123456789") for _ in range(OTP_LENGTH))


def _generate_qr() -> str:
    return f"{QR_PREFIX}-{uuid.uuid4().hex[:12].upper()}"


async def get_or_create_visitor(
    db: AsyncSession,
    phone: str,
    full_name: str,
    email: Optional[str] = None,
) -> Visitor:
    """Get existing visitor by phone or create new."""
    result = await db.execute(select(Visitor).where(Visitor.phone == phone))
    visitor = result.scalar_one_or_none()
    if visitor:
        if full_name and visitor.full_name != full_name:
            visitor.full_name = full_name
        if email is not None:
            visitor.email = email
        await db.flush()
        return visitor

    visitor = Visitor(phone=phone, full_name=full_name, email=email)
    db.add(visitor)
    await db.flush()
    return visitor


async def create_invitation(
    db: AsyncSession,
    host_id: UUID,
    visitor_phone: str,
    visitor_name: str,
    visitor_email: Optional[str] = None,
    purpose: Optional[str] = None,
    expected_arrival: Optional[datetime] = None,
) -> Visit:
    """Create visit invitation with QR and OTP."""
    visitor = await get_or_create_visitor(db, visitor_phone, visitor_name, visitor_email)

    host = await db.get(User, host_id)
    if host and host.society_id and await is_visitor_blacklisted_for_society(db, visitor.id, host.society_id):
        raise ValueError("Visitor is blacklisted in this society")

    expires_at = datetime.utcnow() + timedelta(minutes=OTP_EXPIRE_MINUTES)
    visit = Visit(
        visitor_id=visitor.id,
        host_id=host_id,
        status=VisitStatus.PENDING,
        purpose=purpose,
        expected_arrival=expected_arrival,
        qr_code=_generate_qr(),
        otp=_generate_otp(),
        otp_expires_at=expires_at,
    )
    db.add(visit)
    await db.flush()
    return visit


async def create_walkin_visit(
    db: AsyncSession,
    host_id: UUID,
    visitor_phone: str,
    visitor_name: str,
    purpose: Optional[str] = None,
    guard_id: Optional[UUID] = None,
    building_name: Optional[str] = None,
    flat_number: Optional[str] = None,
) -> Visit:
    """
    Walk-in / manual entry by guard. No OTP for visitor.
    Creates visit as PENDING - resident (host) must approve via dashboard/app.
    Guard selects resident by tower+flat or host_id → notification goes to that resident's device →
    resident approves → guard marks check-in (by visit_id, no OTP).
    """
    visitor = await get_or_create_visitor(db, visitor_phone, visitor_name)

    host = await db.get(User, host_id)
    if host and host.society_id and await is_visitor_blacklisted_for_society(db, visitor.id, host.society_id):
        raise ValueError("Visitor is blacklisted in this society")

    visit = Visit(
        visitor_id=visitor.id,
        host_id=host_id,
        status=VisitStatus.PENDING,  # Wait for resident approval
        purpose=purpose or "Walk-in",
        qr_code=None,  # No QR/OTP for walk-in; guard will check-in by visit_id after approval
        otp=None,
        otp_expires_at=None,
        extra_data={"walkin": True, "guard_id": str(guard_id) if guard_id else None},
    )
    db.add(visit)
    await db.flush()
    await db.refresh(visit, ["visitor", "host"])

    # Notify resident (by tower/flat) so they get alert on device to approve/reject
    notif_body = f"{visitor.full_name} is at the gate."
    if building_name or flat_number:
        parts = [p for p in [building_name, flat_number] if p]
        if parts:
            notif_body += f" Flat: {' - '.join(parts)}."
    notif_body += " Approve or reject from the app."
    notif = Notification(
        user_id=host_id,
        type="walkin_pending",
        title="Visitor at gate",
        body=notif_body,
        read=False,
        extra_data=json.dumps({
            "visit_id": str(visit.id),
            "visitor_name": visitor.full_name,
            "visitor_phone": visitor.phone,
        }),
    )
    db.add(notif)
    await db.flush()
    return visit


async def get_visit_by_id(db: AsyncSession, visit_id: UUID) -> Optional[Visit]:
    """Get visit by ID. Eager-loads visitor and host."""
    result = await db.execute(
        select(Visit)
        .options(selectinload(Visit.visitor), selectinload(Visit.host))
        .where(Visit.id == visit_id)
    )
    return result.scalar_one_or_none()


async def get_visit_by_otp(db: AsyncSession, otp: str) -> Optional[Visit]:
    """Get visit by OTP (valid, not expired). Eager-loads visitor."""
    result = await db.execute(
        select(Visit)
        .options(selectinload(Visit.visitor))
        .where(
            and_(
                Visit.otp == otp,
                Visit.otp_expires_at > datetime.utcnow(),
                Visit.status.in_([VisitStatus.PENDING, VisitStatus.APPROVED]),
            )
        )
    )
    return result.scalar_one_or_none()


async def get_visit_by_qr(db: AsyncSession, qr_code: str) -> Optional[Visit]:
    """Get visit by QR code (valid, not expired). Eager-loads visitor. QR expires with OTP."""
    result = await db.execute(
        select(Visit)
        .options(selectinload(Visit.visitor))
        .where(
            and_(
                Visit.qr_code == qr_code,
                Visit.otp_expires_at > datetime.utcnow(),
                Visit.status.in_([VisitStatus.PENDING, VisitStatus.APPROVED]),
            )
        )
    )
    return result.scalar_one_or_none()


def _validate_arrival_window(visit: Visit) -> None:
    """Raise ValueError if expected_arrival is set and current time is outside window."""
    if not visit.expected_arrival:
        return
    now = datetime.utcnow()
    window = timedelta(minutes=ARRIVAL_WINDOW_MINUTES)
    if now < visit.expected_arrival - window:
        raise ValueError(
            f"Check-in too early. Expected arrival: {visit.expected_arrival.strftime('%H:%M')}. "
            f"You can check in up to {ARRIVAL_WINDOW_MINUTES} minutes before."
        )
    if now > visit.expected_arrival + window:
        raise ValueError(
            f"Check-in window expired. Expected arrival: {visit.expected_arrival.strftime('%H:%M')}. "
            f"Check-in allowed up to {ARRIVAL_WINDOW_MINUTES} minutes after."
        )


async def checkin_visit(
    db: AsyncSession,
    visit: Visit,
    photo_url: Optional[str] = None,
) -> Visit:
    """
    Check-in a visit.
    Re-checks blacklist. Validates arrival window. Records DPDP consent log. Notifies host.
    """
    # Re-check blacklist at check-in (visitor may have been blacklisted after invite)
    await db.refresh(visit, ["visitor", "host"])
    if visit.host and visit.host.society_id and await is_visitor_blacklisted_for_society(
        db, visit.visitor_id, visit.host.society_id
    ):
        raise ValueError("Visitor is blacklisted - access denied")

    _validate_arrival_window(visit)

    now = datetime.utcnow()
    visit.status = VisitStatus.CHECKED_IN
    visit.actual_arrival = now
    visit.consent_given = True
    visit.consent_timestamp = now
    if photo_url:
        visit.checkin_photo_url = photo_url

    # DPDP: Create immutable consent log
    consent_log = ConsentLog(
        visit_id=visit.id,
        consent_type="data_collection",
        consent_given=True,
        consent_text="I consent to my data being collected for this visit (DPDP Act 2023)",
        timestamp=now,
    )
    db.add(consent_log)

    # Host notification: "Visitor arrived"
    import json
    notif = Notification(
        user_id=visit.host_id,
        type="visitor_arrived",
        title="Visitor checked in",
        body=f"{visit.visitor.full_name} has checked in.",
        read=False,
        extra_data=json.dumps({"visit_id": str(visit.id), "visitor_name": visit.visitor.full_name}),
    )
    db.add(notif)
    await db.flush()
    return visit


async def approve_visit(db: AsyncSession, visit: Visit) -> Visit:
    """
    Approve a pending visit (resident or admin).
    For walk-ins: resident approval = permission to enter, so we auto check-in (no guard action).
    """
    if visit.status != VisitStatus.PENDING:
        raise ValueError(f"Cannot approve visit with status {visit.status.value}")
    visit.status = VisitStatus.APPROVED
    await db.flush()

    # Walk-in: resident approved = allow entry; auto check-in so guard does not need a separate action
    extra = visit.extra_data or {}
    if extra.get("walkin") is True:
        await db.refresh(visit, ["visitor", "host"])
        try:
            visit = await checkin_visit(db, visit)
        except ValueError:
            pass  # e.g. blacklisted; leave as approved only
    return visit


async def checkout_visit(db: AsyncSession, visit: Visit) -> Visit:
    """Check-out a visit."""
    visit.status = VisitStatus.CHECKED_OUT
    visit.actual_departure = datetime.utcnow()
    await db.flush()
    return visit


async def get_dashboard_stats(db: AsyncSession, society_id: Optional[UUID] = None) -> dict:
    """Get dashboard statistics. Optionally filter by host's society_id."""
    today = datetime.utcnow().date()

    # Visitors today (unique)
    vt_q = select(func.count(func.distinct(Visit.visitor_id))).select_from(Visit)
    if society_id:
        vt_q = vt_q.join(User, Visit.host_id == User.id).where(User.society_id == society_id)
    vt_q = vt_q.where(func.date(Visit.created_at) == today)
    visitors_today = await db.execute(vt_q)
    vt = visitors_today.scalar() or 0

    # Pending
    p_q = select(func.count(Visit.id)).select_from(Visit)
    if society_id:
        p_q = p_q.join(User, Visit.host_id == User.id).where(User.society_id == society_id)
    p_q = p_q.where(Visit.status == VisitStatus.PENDING)
    pending = await db.execute(p_q)
    p = pending.scalar() or 0

    # Checked in
    ci_q = select(func.count(Visit.id)).select_from(Visit)
    if society_id:
        ci_q = ci_q.join(User, Visit.host_id == User.id).where(User.society_id == society_id)
    ci_q = ci_q.where(Visit.status == VisitStatus.CHECKED_IN)
    checked_in = await db.execute(ci_q)
    ci = checked_in.scalar() or 0

    return {"visitors_today": vt, "pending_approvals": p, "checked_in": ci}


async def list_visits(
    db: AsyncSession,
    limit: int = 50,
    offset: int = 0,
    status: Optional[str] = None,
    host_id: Optional[UUID] = None,
    society_id: Optional[UUID] = None,
) -> list[Visit]:
    """List visits with optional status, host_id, and society_id filter. Eager-loads visitor and host."""
    q = (
        select(Visit)
        .options(selectinload(Visit.visitor), selectinload(Visit.host))
        .order_by(Visit.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    if society_id:
        q = q.join(User, Visit.host_id == User.id).where(User.society_id == society_id)
    if status:
        try:
            status_enum = VisitStatus(status)
            q = q.where(Visit.status == status_enum)
        except ValueError:
            pass
    if host_id:
        q = q.where(Visit.host_id == host_id)
    result = await db.execute(q)
    return list(result.scalars().unique().all())


async def get_checked_in_visitors(db: AsyncSession, society_id: Optional[UUID] = None) -> list[Visit]:
    """Get all currently checked-in visits (for muster/emergency export). Optionally filter by society."""
    return await list_visits(db, limit=500, status="checked_in", society_id=society_id)
