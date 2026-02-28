"""Blacklist service - add/remove visitors from blacklist (per society)."""
from typing import Optional
from uuid import UUID

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.visitor import Visitor, Blacklist
from app.services.visit_service import get_or_create_visitor


async def is_visitor_blacklisted_for_society(
    db: AsyncSession,
    visitor_id: UUID,
    society_id: UUID,
) -> bool:
    """True if visitor is blacklisted for this society. Per-society blacklist."""
    result = await db.execute(
        select(Blacklist).where(
            and_(
                Blacklist.visitor_id == visitor_id,
                Blacklist.society_id == society_id,
                Blacklist.is_active == True,
            )
        ).limit(1)
    )
    if result.scalar_one_or_none():
        return True
    # Legacy: no society_id on Blacklist row meant global blacklist
    result = await db.execute(
        select(Blacklist).where(
            and_(
                Blacklist.visitor_id == visitor_id,
                Blacklist.society_id.is_(None),
                Blacklist.is_active == True,
            )
        ).limit(1)
    )
    return result.scalar_one_or_none() is not None


async def add_to_blacklist(
    db: AsyncSession,
    visitor_id: UUID,
    reason: str,
    blacklisted_by: UUID,
    society_id: UUID,
) -> Visitor:
    """Add visitor to this society's blacklist. Creates Blacklist record with society_id."""
    result = await db.execute(select(Visitor).where(Visitor.id == visitor_id))
    visitor = result.scalar_one_or_none()
    if not visitor:
        raise ValueError("Visitor not found")

    # Already blacklisted in this society?
    if await is_visitor_blacklisted_for_society(db, visitor_id, society_id):
        raise ValueError("Visitor is already blacklisted in this society")

    bl = Blacklist(
        visitor_id=visitor_id,
        society_id=society_id,
        reason=reason,
        blacklisted_by=blacklisted_by,
        is_active=True,
    )
    db.add(bl)
    await db.flush()
    # Keep Visitor.is_blacklisted for backward compat / "ever blacklisted anywhere" display
    visitor.is_blacklisted = True
    await db.flush()
    return visitor


async def remove_from_blacklist(
    db: AsyncSession,
    visitor_id: UUID,
    society_id: UUID,
) -> Visitor:
    """Remove visitor from this society's blacklist. Deactivates Blacklist row(s) for this society."""
    result = await db.execute(select(Visitor).where(Visitor.id == visitor_id))
    visitor = result.scalar_one_or_none()
    if not visitor:
        raise ValueError("Visitor not found")

    bl_result = await db.execute(
        select(Blacklist).where(
            Blacklist.visitor_id == visitor_id,
            Blacklist.society_id == society_id,
            Blacklist.is_active == True,
        )
    )
    rows = bl_result.scalars().all()
    if not rows:
        raise ValueError("Visitor is not blacklisted in this society")
    for bl in rows:
        bl.is_active = False
    await db.flush()
    # If no other society has this visitor blacklisted, clear the global flag
    other = await db.execute(
        select(Blacklist).where(
            Blacklist.visitor_id == visitor_id,
            Blacklist.is_active == True,
        ).limit(1)
    )
    if other.scalar_one_or_none() is None:
        visitor.is_blacklisted = False
        await db.flush()
    return visitor


async def add_to_blacklist_by_phone(
    db: AsyncSession,
    phone: str,
    full_name: str,
    reason: str,
    blacklisted_by: UUID,
    society_id: UUID,
) -> Visitor:
    """Add visitor to this society's blacklist by phone. Creates visitor if not exists."""
    visitor = await get_or_create_visitor(db, phone=phone, full_name=full_name)
    return await add_to_blacklist(db, visitor.id, reason, blacklisted_by, society_id)


async def list_blacklisted(
    db: AsyncSession,
    society_id: UUID,
) -> list[tuple[Visitor, Optional[str]]]:
    """List blacklisted visitors for this society. Returns (visitor, reason)."""
    result = await db.execute(
        select(Blacklist, Visitor)
        .join(Visitor, Blacklist.visitor_id == Visitor.id)
        .where(
            and_(
                Blacklist.society_id == society_id,
                Blacklist.is_active == True,
            )
        )
        .order_by(Blacklist.created_at.desc())
    )
    out = []
    seen = set()
    for bl, visitor in result.all():
        if visitor.id not in seen:
            seen.add(visitor.id)
            out.append((visitor, bl.reason))
    return out
