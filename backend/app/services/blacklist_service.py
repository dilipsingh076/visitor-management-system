"""Blacklist service - add/remove visitors from blacklist."""
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.visitor import Visitor, Blacklist
from app.services.visit_service import get_or_create_visitor


async def add_to_blacklist(
    db: AsyncSession,
    visitor_id: UUID,
    reason: str,
    blacklisted_by: UUID,
) -> Visitor:
    """Add visitor to blacklist. Sets is_blacklisted=True and creates Blacklist record."""
    result = await db.execute(
        select(Visitor).where(Visitor.id == visitor_id)
    )
    visitor = result.scalar_one_or_none()
    if not visitor:
        raise ValueError("Visitor not found")
    if visitor.is_blacklisted:
        raise ValueError("Visitor is already blacklisted")

    visitor.is_blacklisted = True
    bl = Blacklist(
        visitor_id=visitor_id,
        reason=reason,
        blacklisted_by=blacklisted_by,
        is_active=True,
    )
    db.add(bl)
    await db.flush()
    return visitor


async def remove_from_blacklist(
    db: AsyncSession,
    visitor_id: UUID,
) -> Visitor:
    """Remove visitor from blacklist. Sets is_blacklisted=False and Blacklist.is_active=False."""
    result = await db.execute(
        select(Visitor).where(Visitor.id == visitor_id)
    )
    visitor = result.scalar_one_or_none()
    if not visitor:
        raise ValueError("Visitor not found")
    if not visitor.is_blacklisted:
        raise ValueError("Visitor is not blacklisted")

    visitor.is_blacklisted = False
    bl_result = await db.execute(
        select(Blacklist).where(Blacklist.visitor_id == visitor_id, Blacklist.is_active == True)
    )
    for bl in bl_result.scalars().all():
        bl.is_active = False
    await db.flush()
    return visitor


async def add_to_blacklist_by_phone(
    db: AsyncSession,
    phone: str,
    full_name: str,
    reason: str,
    blacklisted_by: UUID,
) -> Visitor:
    """Add visitor to blacklist by phone. Creates visitor if not exists."""
    visitor = await get_or_create_visitor(db, phone=phone, full_name=full_name)
    return await add_to_blacklist(db, visitor.id, reason, blacklisted_by)


async def list_blacklisted(db: AsyncSession) -> list[tuple[Visitor, Optional[str]]]:
    """List all blacklisted visitors with their blacklist reason. Returns (visitor, reason)."""
    result = await db.execute(
        select(Visitor)
        .where(Visitor.is_blacklisted == True)
        .order_by(Visitor.updated_at.desc())
    )
    visitors = list(result.scalars().all())
    out = []
    for v in visitors:
        bl_res = await db.execute(
            select(Blacklist).where(
                Blacklist.visitor_id == v.id,
                Blacklist.is_active == True
            ).order_by(Blacklist.created_at.desc()).limit(1)
        )
        bl = bl_res.scalar_one_or_none()
        out.append((v, bl.reason if bl else None))
    return out
