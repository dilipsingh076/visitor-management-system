"""Database seed for demo users (residents) and guards."""
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


DEMO_USER_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")
RESIDENT_2_ID = uuid.UUID("00000000-0000-0000-0000-000000000002")
RESIDENT_3_ID = uuid.UUID("00000000-0000-0000-0000-000000000003")
DEMO_GUARD_ID = uuid.UUID("00000000-0000-0000-0000-000000000010")

DEMO_RESIDENTS = [
    (DEMO_USER_ID, "demo-user", "demo@vms.local", "Demo Resident", "A-101"),
    (RESIDENT_2_ID, "resident-2", "resident2@vms.local", "Rajesh Kumar", "B-202"),
    (RESIDENT_3_ID, "resident-3", "resident3@vms.local", "Priya Sharma", "C-303"),
]


async def ensure_demo_users(db: AsyncSession) -> list[User]:
    """Create demo residents and guard if not exist. Returns list of residents."""
    residents = []
    for uid, kc_id, email, name, flat in DEMO_RESIDENTS:
        result = await db.execute(select(User).where(User.id == uid))
        user = result.scalar_one_or_none()
        if not user:
            user = User(
                id=uid,
                keycloak_id=kc_id,
                email=email,
                full_name=name,
                role="resident",
                is_active=True,
                extra_data={"flat_no": flat},
            )
            db.add(user)
        residents.append(user)

    # Demo guard
    result = await db.execute(select(User).where(User.id == DEMO_GUARD_ID))
    guard = result.scalar_one_or_none()
    if not guard:
        guard = User(
            id=DEMO_GUARD_ID,
            keycloak_id="demo-guard",
            email="guard@vms.local",
            full_name="Security Guard",
            role="guard",
            is_active=True,
        )
        db.add(guard)

    await db.flush()
    return residents


async def ensure_demo_user(db: AsyncSession) -> User:
    """Backward compat: create demo user if not exists."""
    residents = await ensure_demo_users(db)
    return residents[0]
