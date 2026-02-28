"""Blacklist management API - guard/admin only. Blacklist is per society."""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_db, get_current_guard, get_current_user_id
from app.db.seed import ensure_demo_user
from app.schemas.blacklist import BlacklistAddRequest, BlacklistByPhoneRequest
from app.services.blacklist_service import (
    add_to_blacklist,
    add_to_blacklist_by_phone,
    remove_from_blacklist,
    list_blacklisted,
)

router = APIRouter()


def _society_id_required(current_user: dict) -> UUID:
    """Require current user to belong to a society (for blacklist scope)."""
    sid = current_user.get("society_id")
    if not sid:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Blacklist is scoped to a society. You must belong to a society.",
        )
    try:
        return UUID(sid)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid society_id")


def _to_entry(v, reason: str | None) -> dict:
    return {
        "id": str(v.id),
        "visitor_id": str(v.id),
        "visitor_name": v.full_name,
        "visitor_phone": v.phone,
        "reason": reason or "—",
        "created_at": v.updated_at.isoformat(),
    }


@router.get("/")
async def list_blacklist_api(
    db=Depends(get_db),
    current_user=Depends(get_current_guard),
):
    """List blacklisted visitors for your society. Guard/admin only."""
    await ensure_demo_user(db)
    society_id = _society_id_required(current_user)
    entries = await list_blacklisted(db, society_id=society_id)
    return [_to_entry(v, reason) for v, reason in entries]


@router.post("/")
async def add_blacklist(
    data: BlacklistAddRequest,
    db=Depends(get_db),
    current_user=Depends(get_current_guard),
    user_id=Depends(get_current_user_id),
):
    """Add visitor to your society's blacklist by visitor_id. Guard/admin only."""
    await ensure_demo_user(db)
    society_id = _society_id_required(current_user)
    try:
        visitor = await add_to_blacklist(
            db=db,
            visitor_id=data.visitor_id,
            reason=data.reason,
            blacklisted_by=user_id,
            society_id=society_id,
        )
        await db.commit()
        return {"message": "Visitor blacklisted", "visitor_id": str(visitor.id)}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/by-phone")
async def add_blacklist_by_phone(
    data: BlacklistByPhoneRequest,
    db=Depends(get_db),
    current_user=Depends(get_current_guard),
    user_id=Depends(get_current_user_id),
):
    """Add visitor to your society's blacklist by phone (creates visitor if not exists). Guard/admin only."""
    await ensure_demo_user(db)
    society_id = _society_id_required(current_user)
    try:
        visitor = await add_to_blacklist_by_phone(
            db=db,
            phone=data.visitor_phone,
            full_name=data.visitor_name,
            reason=data.reason,
            blacklisted_by=user_id,
            society_id=society_id,
        )
        await db.commit()
        return {"message": "Visitor blacklisted", "visitor_id": str(visitor.id)}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{visitor_id}")
async def remove_blacklist(
    visitor_id: UUID,
    db=Depends(get_db),
    current_user=Depends(get_current_guard),
):
    """Remove visitor from your society's blacklist. Guard/admin only."""
    await ensure_demo_user(db)
    society_id = _society_id_required(current_user)
    try:
        visitor = await remove_from_blacklist(db=db, visitor_id=visitor_id, society_id=society_id)
        await db.commit()
        return {"message": "Visitor removed from blacklist", "visitor_id": str(visitor.id)}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
