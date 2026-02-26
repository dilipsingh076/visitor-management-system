"""Residents API - list residents for guard to select when registering walk-in. Guard/admin only."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, get_current_guard_or_admin
from app.db.seed import ensure_demo_users
from app.models.user import User

router = APIRouter()


@router.get("/")
async def list_residents(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_guard_or_admin),
    limit: int = Query(100, le=200),
    q: str | None = Query(None, description="Search by name or flat_no (autocomplete)."),
):
    """
    List residents (hosts) for guard to select when registering walk-in.
    Guard or admin only. Scoped by current user's society.
    """
    await ensure_demo_users(db)

    stmt = (
        select(User)
        .where(User.role.in_(["resident", "admin"]), User.is_active == True)
        .order_by(User.full_name)
        .limit(limit)
    )
    society_id = current_user.get("society_id")
    if society_id:
        try:
            from uuid import UUID
            stmt = stmt.where(User.society_id == UUID(society_id))
        except (ValueError, TypeError):
            pass
    if q and q.strip():
        search = f"%{q.strip()}%"
        stmt = stmt.where(
            or_(
                User.full_name.ilike(search),
                User.email.ilike(search),
                User.flat_number.ilike(search),
            )
        )
    result = await db.execute(stmt)
    users = result.scalars().all()

    return [
        {
            "id": str(u.id),
            "full_name": u.full_name,
            "email": u.email,
            "phone": u.phone or "",
            "flat_no": getattr(u, "flat_number", None) or (u.extra_data or {}).get("flat_no", ""),
        }
        for u in users
    ]
