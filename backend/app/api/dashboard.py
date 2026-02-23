"""Dashboard endpoints. RBAC: stats=any auth; my-requests=resident/admin; muster=guard/admin."""
from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
import io
import csv
from datetime import datetime

from app.core.dependencies import get_db, get_current_user, get_current_user_id, get_current_resident_or_admin, get_current_guard_or_admin
from app.core.rbac import log_admin_action
from app.schemas.dashboard import DashboardStatsResponse
from app.services.visit_service import get_dashboard_stats, list_visits, get_checked_in_visitors
from app.models.visitor import VisitStatus
from app.api.visitors import _visit_to_response

router = APIRouter()


@router.get("/stats", response_model=DashboardStatsResponse)
async def get_stats(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Dashboard statistics. Authenticated users only."""
    stats = await get_dashboard_stats(db)
    return DashboardStatsResponse(**stats)


@router.get("/my-requests")
async def get_my_visit_requests(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_resident_or_admin),
    current_user_id=Depends(get_current_user_id),
):
    """
    Pending visit requests for current resident (walk-ins waiting your approval).
    Resident or admin only.
    """
    visits = await list_visits(
        db, limit=20, status="pending", host_id=current_user_id
    )
    return {"count": len(visits), "visits": [_visit_to_response(v) for v in visits]}


@router.get("/muster")
async def get_muster(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_guard_or_admin),
    current_user_id=Depends(get_current_user_id),
    format: str | None = None,
):
    """
    Emergency muster: list of people currently inside (checked-in).
    Guard or admin only. Use ?format=csv to download CSV.
    """
    visits = await get_checked_in_visitors(db)
    await log_admin_action(
        db, current_user_id, current_user,
        "muster_export", request.url.path, request.method,
        {"format": format, "count": len(visits)},
    )
    data = [
        {
            "visitor_name": v.visitor.full_name,
            "visitor_phone": v.visitor.phone,
            "host_name": v.host.full_name if v.host else "",
            "purpose": v.purpose or "",
            "checkin_time": v.actual_arrival.isoformat() if v.actual_arrival else "",
        }
        for v in visits
    ]
    if format == "csv":
        output = io.StringIO()
        writer = csv.DictWriter(
            output,
            fieldnames=["visitor_name", "visitor_phone", "host_name", "purpose", "checkin_time"],
        )
        writer.writeheader()
        writer.writerows(data)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=muster_{datetime.utcnow().strftime('%Y%m%d_%H%M')}.csv"
            },
        )
    return {"count": len(data), "visitors": data}
