"""Check-in/check-out endpoints. RBAC: guard or admin only."""
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, get_current_guard_or_admin, get_current_user_id
from app.core.rbac import log_admin_action
from app.schemas.checkin import CheckInRequest, CheckOutRequest, CheckInResponse
from app.services.visit_service import (
    get_visit_by_id,
    get_visit_by_otp,
    get_visit_by_qr,
    checkin_visit,
    checkout_visit,
)

router = APIRouter()


@router.post("/otp")
async def checkin_otp(
    request: Request,
    data: CheckInRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_guard_or_admin),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Check-in visitor via OTP."""
    if not data.otp:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP required")

    visit = await get_visit_by_otp(db, data.otp)
    if not visit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid or expired OTP")
    await db.refresh(visit, ["host"])
    if current_user.get("society_id") and visit.host and str(visit.host.society_id) != current_user.get("society_id"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Visit does not belong to your society")

    if not data.consent_given:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Consent required: Please agree to data collection (DPDP Act 2023)",
        )
    try:
        visit = await checkin_visit(db, visit)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    await log_admin_action(
        db, current_user_id, current_user,
        "checkin_otp", request.url.path, request.method,
        {"visit_id": str(visit.id)},
    )
    return CheckInResponse(
        visit_id=visit.id,
        status="checked_in",
        checkin_time=visit.actual_arrival or datetime.utcnow(),
        message="Check-in successful",
    )


@router.post("/qr")
async def checkin_qr(
    request: Request,
    data: CheckInRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_guard_or_admin),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Check-in visitor via QR code."""
    if not data.qr_code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="QR code required")

    visit = await get_visit_by_qr(db, data.qr_code)
    if not visit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid or expired QR code")
    await db.refresh(visit, ["host"])
    if current_user.get("society_id") and visit.host and str(visit.host.society_id) != current_user.get("society_id"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Visit does not belong to your society")

    if not data.consent_given:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Consent required: Please agree to data collection (DPDP Act 2023)",
        )
    try:
        visit = await checkin_visit(db, visit)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    await log_admin_action(
        db, current_user_id, current_user,
        "checkin_qr", request.url.path, request.method,
        {"visit_id": str(visit.id)},
    )
    return CheckInResponse(
        visit_id=visit.id,
        status="checked_in",
        checkin_time=visit.actual_arrival or datetime.utcnow(),
        message="Check-in successful",
    )


@router.post("/checkout")
async def checkout(
    request: Request,
    data: CheckOutRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_guard_or_admin),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Check-out visitor. Guard or admin only."""
    visit = await get_visit_by_id(db, data.visit_id)
    if not visit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Visit not found")
    if visit.status.value == "checked_out":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already checked out")

    visit = await checkout_visit(db, visit)
    await log_admin_action(
        db, current_user_id, current_user,
        "checkout", request.url.path, request.method,
        {"visit_id": str(visit.id)},
    )
    return CheckInResponse(
        visit_id=visit.id,
        status="checked_out",
        checkin_time=visit.actual_departure or datetime.utcnow(),
        message="Check-out successful",
    )
