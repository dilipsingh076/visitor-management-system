"""
Auth service: register society, signup, login (local auth).
"""
import re
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.society import Society, Building
from app.models.user import User
from app.core.security import hash_password, verify_password, create_access_token


def _slugify(text: str) -> str:
    """Generate URL-safe slug from name."""
    text = (text or "").strip().lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[-\s]+", "-", text).strip("-")
    return text or str(uuid.uuid4())[:8]


def _user_to_response(user: User, society: Optional[Society] = None) -> dict:
    """Build user + society dict for API response."""
    roles = [user.role]
    if user.role == "admin":
        roles.append("resident")  # Admin can do resident actions
    data = {
        "id": str(user.id),
        "user_id": str(user.id),
        "email": user.email,
        "username": user.full_name,
        "full_name": user.full_name,
        "roles": roles,
        "role": user.role,
        "phone": user.phone,
        "flat_number": user.flat_number,
        "society_id": str(user.society_id) if user.society_id else None,
        "building_id": str(user.building_id) if user.building_id else None,
    }
    if society:
        data["society"] = {"id": str(society.id), "slug": society.slug, "name": society.name}
    return data


async def register_society(
    db: AsyncSession,
    *,
    society_name: str,
    society_slug: Optional[str] = None,
    address: Optional[str] = None,
    city: Optional[str] = None,
    state: Optional[str] = None,
    pincode: Optional[str] = None,
    country: Optional[str] = None,
    contact_email: str,
    contact_phone: Optional[str] = None,
    registration_number: Optional[str] = None,
    society_type: Optional[str] = None,
    registration_year: Optional[str] = None,
    buildings: Optional[list[dict]] = None,
    email: str,
    password: str,
    full_name: str,
    phone: Optional[str] = None,
    flat_number: Optional[str] = None,
) -> tuple[User, Society, str]:
    """
    Create society, optional buildings, and first admin user. Returns (user, society, token).
    """
    slug = (society_slug or "").strip() or _slugify(society_name)
    # Ensure slug unique
    result = await db.execute(select(Society).where(Society.slug == slug))
    if result.scalar_one_or_none():
        raise ValueError(f"Society with slug '{slug}' already exists")
    # Check email unique
    result = await db.execute(select(User).where(User.email == email.strip().lower()))
    if result.scalar_one_or_none():
        raise ValueError("Email already registered")

    def _opt_str(v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        s = str(v).strip()
        return s if s else None

    society = Society(
        name=(society_name or "").strip() or slug,
        slug=slug,
        address=_opt_str(address),
        city=_opt_str(city),
        state=_opt_str(state),
        pincode=_opt_str(pincode),
        country=(str(country).strip() if country else "India").strip() or "India",
        contact_email=(contact_email or "").strip(),
        contact_phone=_opt_str(contact_phone),
        registration_number=_opt_str(registration_number),
        society_type=_opt_str(society_type),
        registration_year=_opt_str(registration_year),
        plan="basic",
        status="active",
        is_active=True,
    )
    db.add(society)
    await db.flush()

    building_ids = []
    for i, b in enumerate(buildings or []):
        name = (b.get("name") or "").strip()
        if not name:
            continue
        code = (b.get("code") or "").strip() or None
        building = Building(
            society_id=society.id,
            name=name,
            code=code,
            sort_order=i,
            is_active=True,
        )
        db.add(building)
        await db.flush()
        building_ids.append(building.id)

    admin = User(
        email=(email or "").strip().lower(),
        full_name=(full_name or "").strip(),
        phone=_opt_str(phone),
        flat_number=_opt_str(flat_number),
        role="admin",
        is_active=True,
        password_hash=hash_password(password),
        society_id=society.id,
        building_id=building_ids[0] if building_ids else None,
        keycloak_id=None,
    )
    db.add(admin)
    await db.flush()

    token = create_access_token(
        user_id=str(admin.id),
        email=admin.email,
        roles=[admin.role, "resident"],
        society_id=str(society.id),
        building_id=str(admin.building_id) if admin.building_id else None,
        full_name=admin.full_name,
    )
    return admin, society, token


async def signup(
    db: AsyncSession,
    *,
    email: str,
    password: str,
    full_name: str,
    role: str,
    society_slug: str,
    building_id: Optional[str] = None,
    phone: Optional[str] = None,
    flat_number: Optional[str] = None,
) -> tuple[User, Society, str]:
    """
    Create user (guard or resident) in existing society. Returns (user, society, token).
    Rejects role=admin (400).
    """
    if role == "admin":
        raise ValueError("Admin can only be created via Register Society")
    if role not in ("guard", "resident"):
        raise ValueError("Role must be guard or resident")

    result = await db.execute(select(Society).where(Society.slug == society_slug.strip()))
    society = result.scalar_one_or_none()
    if not society:
        raise ValueError("Society not found")
    if not society.is_active:
        raise ValueError("Society is not active")

    result = await db.execute(select(User).where(User.email == email.strip().lower()))
    if result.scalar_one_or_none():
        raise ValueError("Email already registered")

    building_id_uuid = None
    if building_id:
        from uuid import UUID
        try:
            building_id_uuid = UUID(building_id)
        except ValueError:
            raise ValueError("Invalid building_id")
        result = await db.execute(
            select(Building).where(
                Building.id == building_id_uuid,
                Building.society_id == society.id,
            )
        )
        if not result.scalar_one_or_none():
            raise ValueError("Building not found or does not belong to society")

    user = User(
        email=email.strip().lower(),
        full_name=full_name.strip(),
        phone=phone.strip() if phone else None,
        flat_number=flat_number.strip() if flat_number else None,
        role=role,
        is_active=True,
        password_hash=hash_password(password),
        society_id=society.id,
        building_id=building_id_uuid,
        keycloak_id=None,
    )
    db.add(user)
    await db.flush()

    token = create_access_token(
        user_id=str(user.id),
        email=user.email,
        roles=[user.role],
        society_id=str(society.id),
        building_id=str(user.building_id) if user.building_id else None,
        full_name=user.full_name,
    )
    return user, society, token


async def login(db: AsyncSession, email: str, password: str) -> tuple[User, Optional[Society], str]:
    """
    Authenticate by email + password. Returns (user, society, token).
    """
    result = await db.execute(select(User).where(User.email == email.strip().lower()))
    user = result.scalar_one_or_none()
    if not user:
        raise ValueError("Invalid email or password")
    if not user.password_hash:
        raise ValueError("Invalid email or password")
    if not verify_password(password, user.password_hash):
        raise ValueError("Invalid email or password")
    if not user.is_active:
        raise ValueError("Account is disabled")

    user.last_login = datetime.utcnow()
    db.add(user)
    await db.flush()

    society = None
    if user.society_id:
        result = await db.execute(select(Society).where(Society.id == user.society_id))
        society = result.scalar_one_or_none()

    roles = [user.role]
    if user.role == "admin":
        roles.append("resident")
    token = create_access_token(
        user_id=str(user.id),
        email=user.email,
        roles=roles,
        society_id=str(user.society_id) if user.society_id else None,
        building_id=str(user.building_id) if user.building_id else None,
        full_name=user.full_name,
    )
    return user, society, token
