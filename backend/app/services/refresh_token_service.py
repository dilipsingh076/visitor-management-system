"""
Service functions for issuing, rotating, and revoking refresh tokens.
"""
from datetime import datetime
from typing import Optional, Tuple

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import generate_refresh_token, refresh_token_expiry
from app.models.refresh_token import RefreshToken
from app.models.user import User


async def issue_refresh_token(
    db: AsyncSession,
    user: User,
    *,
    user_agent: Optional[str] = None,
    ip_address: Optional[str] = None,
) -> Tuple[str, RefreshToken]:
    """
    Create a new refresh token for the given user.
    Returns (raw_token, RefreshToken instance).
    """
    token, token_hash = generate_refresh_token()
    rt = RefreshToken(
        user_id=user.id,
        token_hash=token_hash,
        user_agent=user_agent[:255] if user_agent else None,
        ip_address=ip_address[:64] if ip_address else None,
        expires_at=refresh_token_expiry(),
    )
    db.add(rt)
    await db.flush()
    return token, rt


async def rotate_refresh_token(
    db: AsyncSession,
    current_hash: str,
    *,
    user_agent: Optional[str] = None,
    ip_address: Optional[str] = None,
) -> Tuple[Optional[User], Optional[str]]:
    """
    Rotate an existing refresh token (if active).
    Marks the old token as revoked and issues a new one.
    Returns (user, new_raw_token) or (None, None) if invalid/expired.
    """
    result = await db.execute(
        select(RefreshToken).where(RefreshToken.token_hash == current_hash)
    )
    rt = result.scalar_one_or_none()
    if not rt or not rt.is_active():
        return None, None

    # Revoke current token
    rt.revoked = True
    rt.revoked_at = datetime.utcnow()

    # Load user explicitly to avoid lazy-loading in async context
    result = await db.execute(select(User).where(User.id == rt.user_id))
    user = result.scalar_one_or_none()
    if not user:
        return None, None

    # Issue replacement
    new_token, new_rt = await issue_refresh_token(
        db,
        user,
        user_agent=user_agent,
        ip_address=ip_address,
    )
    rt.replaced_by = new_rt.id
    return user, new_token


async def revoke_all_for_user(db: AsyncSession, user: User) -> None:
    """
    Revoke all refresh tokens for a user (used on logout).
    """
    await db.execute(
        update(RefreshToken)
        .where(RefreshToken.user_id == user.id, RefreshToken.revoked.is_(False))
        .values(revoked=True, revoked_at=datetime.utcnow())
    )

