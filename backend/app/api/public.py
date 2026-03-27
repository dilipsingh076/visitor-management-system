"""Public endpoints (no authentication required) for the QR-only visit flow."""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.dependencies import get_db
from app.models.visitor import Visit, VisitStatus
from app.schemas.checkin import VisitPassResponse

router = APIRouter()


@router.get("/pass/{visit_id}", response_model=VisitPassResponse)
async def get_visit_pass(
    visit_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """
    Public pass endpoint for QR-only visit flow.
    Returns limited visit data (no OTP, no phone numbers) so visitors
    can display their QR pass without authentication.
    """
    result = await db.execute(
        select(Visit)
        .options(selectinload(Visit.host))
        .where(Visit.id == visit_id)
    )
    visit = result.scalar_one_or_none()

    if not visit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visit not found",
        )

    visit_status = visit.status
    if isinstance(visit_status, VisitStatus):
        visit_status = visit_status.value

    if visit_status == VisitStatus.CANCELLED.value:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visit not found",
        )

    host_name = visit.host.full_name if visit.host else None
    visitor_name = visit.visitor_name or None
    # Public link: include visitor phone (unmasked as requested).
    visitor_phone = (visit.visitor_phone or "").strip() or None

    return VisitPassResponse(
        visit_id=visit.id,
        visitor_name=visitor_name,
        visitor_phone=visitor_phone,
        qr_code=visit.qr_code,
        status=visit_status,
        purpose=visit.purpose,
        host_name=host_name,
        expected_arrival=visit.expected_arrival,
    )
