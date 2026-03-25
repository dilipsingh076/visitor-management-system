"""
Flats API: CRUD, bulk create, flat members, and data migration.
"""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import JSONResponse
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from app.core.dependencies import get_db, get_current_user, get_current_admin
from app.models.society import Building, Flat, FlatMember
from app.models.user import User
from app.schemas.flat import (
    FlatCreate, FlatBulkCreate, FlatUpdate,
    FlatMemberCreate, FlatMemberUpdate,
)

router = APIRouter()
log = structlog.get_logger()


def _flat_dict(f: Flat, resident_count: int = 0, registered_owner: str | None = None) -> dict:
    return {
        "id": str(f.id),
        "building_id": str(f.building_id),
        "flat_number": f.flat_number,
        "floor": f.floor,
        "flat_type": f.flat_type,
        "occupancy_status": f.occupancy_status,
        "owner_name": f.owner_name,
        "registered_owner": registered_owner,
        "is_active": f.is_active,
        "resident_count": resident_count,
        "created_at": f.created_at.isoformat() if f.created_at else None,
    }


def _member_dict(m: FlatMember) -> dict:
    return {
        "id": str(m.id),
        "flat_id": str(m.flat_id),
        "full_name": m.full_name,
        "phone": m.phone,
        "relation": m.relation,
        "date_of_birth": m.date_of_birth.isoformat() if m.date_of_birth else None,
        "photo_url": m.photo_url,
        "id_proof_type": m.id_proof_type,
        "id_proof_number": m.id_proof_number,
        "is_active": m.is_active,
    }


# ──────────────── Flats CRUD ────────────────


@router.get("/available")
async def list_available_flats(
    building_id: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """Public: list vacant flats for a building (used on signup page)."""
    try:
        bid = UUID(building_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid building_id")

    result = await db.execute(select(Building).where(Building.id == bid))
    building = result.scalar_one_or_none()
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")

    result = await db.execute(
        select(Flat)
        .where(Flat.building_id == bid, Flat.is_active == True, Flat.occupancy_status == "vacant")
        .order_by(Flat.floor.nulls_last(), Flat.flat_number)
    )
    flats = result.scalars().all()
    return JSONResponse(content=[
        {"id": str(f.id), "flat_number": f.flat_number, "floor": f.floor, "flat_type": f.flat_type}
        for f in flats
    ])


@router.get("/")
async def list_flats(
    building_id: str = Query(...),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List flats for a building with resident counts."""
    try:
        bid = UUID(building_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid building_id")

    # Verify building belongs to user's society
    result = await db.execute(select(Building).where(Building.id == bid))
    building = result.scalar_one_or_none()
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")
    user_society = current_user.get("society_id")
    if user_society and str(building.society_id) != str(user_society):
        raise HTTPException(status_code=403, detail="Not allowed")

    # Fetch flats with resident count and registered owner name
    resident_count_sq = (
        select(func.count(User.id))
        .where(User.flat_id == Flat.id, User.is_active == True)
        .correlate(Flat)
        .scalar_subquery()
    )
    owner_name_sq = (
        select(User.full_name)
        .where(User.flat_id == Flat.id, User.is_active == True)
        .correlate(Flat)
        .limit(1)
        .scalar_subquery()
    )
    result = await db.execute(
        select(Flat, resident_count_sq.label("resident_count"), owner_name_sq.label("registered_owner"))
        .where(Flat.building_id == bid, Flat.is_active == True)
        .order_by(Flat.floor.nulls_last(), Flat.flat_number)
    )
    rows = result.all()
    return JSONResponse(content=[_flat_dict(f, rc or 0, ro) for f, rc, ro in rows])


@router.post("/")
async def create_flat(
    body: FlatCreate,
    current_user: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Create a single flat in a building."""
    result = await db.execute(select(Building).where(Building.id == body.building_id))
    building = result.scalar_one_or_none()
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")
    user_society = current_user.get("society_id")
    if user_society and str(building.society_id) != str(user_society):
        raise HTTPException(status_code=403, detail="Not allowed")

    # Check duplicate
    exists = await db.execute(
        select(Flat).where(
            Flat.building_id == body.building_id,
            Flat.flat_number == body.flat_number.strip(),
        )
    )
    if exists.scalar_one_or_none():
        raise HTTPException(status_code=400, detail=f"Flat {body.flat_number} already exists in this building")

    flat = Flat(
        building_id=body.building_id,
        flat_number=body.flat_number.strip(),
        floor=body.floor,
        flat_type=body.flat_type.strip() if body.flat_type else None,
        owner_name=body.owner_name.strip() if body.owner_name else None,
    )
    db.add(flat)
    await db.flush()
    return JSONResponse(content=_flat_dict(flat), status_code=201)


@router.post("/bulk")
async def bulk_create_flats(
    body: FlatBulkCreate,
    current_user: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Bulk create flats for a building. Generates flat numbers like 101-104, 201-204..."""
    result = await db.execute(select(Building).where(Building.id == body.building_id))
    building = result.scalar_one_or_none()
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")
    user_society = current_user.get("society_id")
    if user_society and str(building.society_id) != str(user_society):
        raise HTTPException(status_code=403, detail="Not allowed")

    # Get existing flat numbers for this building
    existing = await db.execute(
        select(Flat.flat_number).where(Flat.building_id == body.building_id)
    )
    existing_numbers = {r[0] for r in existing.all()}

    created = []
    skipped = 0
    for floor in range(body.start_floor, body.start_floor + body.total_floors):
        for unit in range(1, body.units_per_floor + 1):
            flat_number = f"{floor}{unit:02d}" if floor >= 0 else f"B{abs(floor)}{unit:02d}"
            if flat_number in existing_numbers:
                skipped += 1
                continue
            flat = Flat(
                building_id=body.building_id,
                flat_number=flat_number,
                floor=floor,
                flat_type=body.flat_type.strip() if body.flat_type else None,
            )
            db.add(flat)
            created.append(flat)

    await db.flush()
    return JSONResponse(
        content={
            "created": len(created),
            "skipped": skipped,
            "flats": [_flat_dict(f) for f in created],
        },
        status_code=201,
    )


@router.patch("/{flat_id}")
async def update_flat(
    flat_id: str,
    body: FlatUpdate,
    current_user: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update a flat."""
    try:
        fid = UUID(flat_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid flat_id")

    result = await db.execute(select(Flat).where(Flat.id == fid))
    flat = result.scalar_one_or_none()
    if not flat:
        raise HTTPException(status_code=404, detail="Flat not found")

    if body.flat_number is not None:
        flat.flat_number = body.flat_number.strip()
    if body.floor is not None:
        flat.floor = body.floor
    if body.flat_type is not None:
        flat.flat_type = body.flat_type.strip() or None
    if body.occupancy_status is not None:
        flat.occupancy_status = body.occupancy_status
    if body.owner_name is not None:
        flat.owner_name = body.owner_name.strip() or None
    if body.is_active is not None:
        flat.is_active = body.is_active

    db.add(flat)
    await db.flush()
    return JSONResponse(content=_flat_dict(flat))


@router.post("/{flat_id}/remove-resident")
async def remove_resident_from_flat(
    flat_id: str,
    current_user: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Remove the resident (user) from a flat. Unlinks user.flat_id and sets flat to vacant."""
    try:
        fid = UUID(flat_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid flat_id")

    result = await db.execute(select(Flat).where(Flat.id == fid))
    flat = result.scalar_one_or_none()
    if not flat:
        raise HTTPException(status_code=404, detail="Flat not found")

    # Find user linked to this flat
    result = await db.execute(
        select(User).where(User.flat_id == fid, User.is_active == True)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=400, detail="No resident assigned to this flat")

    # Unlink user from flat
    user.flat_id = None
    user.flat_number = None
    db.add(user)

    # Set flat back to vacant
    flat.occupancy_status = "vacant"
    db.add(flat)
    await db.flush()

    return JSONResponse(content={"ok": True, "removed_user": user.full_name})


# ──────────────── Flat Members ────────────────


async def _verify_flat_access(flat_id: str, current_user: dict, db: AsyncSession) -> Flat:
    """Verify user has access to this flat (owner or admin)."""
    try:
        fid = UUID(flat_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid flat_id")

    result = await db.execute(select(Flat).where(Flat.id == fid))
    flat = result.scalar_one_or_none()
    if not flat:
        raise HTTPException(status_code=404, detail="Flat not found")

    # Admin can access any flat in their society
    user_roles = current_user.get("realm_access", {}).get("roles", [])
    is_admin = any(r in ("chairman", "secretary", "treasurer", "platform_admin") for r in user_roles)
    if is_admin:
        return flat

    # Resident can only access their own flat
    user_id = current_user.get("user_id") or current_user.get("sub")
    if user_id:
        result = await db.execute(select(User).where(User.id == UUID(str(user_id))))
        user = result.scalar_one_or_none()
        if user and user.flat_id and str(user.flat_id) == str(fid):
            return flat

    raise HTTPException(status_code=403, detail="Not allowed to access this flat")


@router.get("/{flat_id}/members")
async def list_flat_members(
    flat_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List members of a flat."""
    flat = await _verify_flat_access(flat_id, current_user, db)
    result = await db.execute(
        select(FlatMember)
        .where(FlatMember.flat_id == flat.id, FlatMember.is_active == True)
        .order_by(FlatMember.full_name)
    )
    members = result.scalars().all()
    return JSONResponse(content=[_member_dict(m) for m in members])


@router.post("/{flat_id}/members")
async def add_flat_member(
    flat_id: str,
    body: FlatMemberCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add a member to a flat. Owner or admin."""
    flat = await _verify_flat_access(flat_id, current_user, db)
    member = FlatMember(
        flat_id=flat.id,
        full_name=body.full_name.strip(),
        phone=body.phone.strip() if body.phone else None,
        relation=body.relation,
        date_of_birth=body.date_of_birth,
        id_proof_type=body.id_proof_type.strip() if body.id_proof_type else None,
        id_proof_number=body.id_proof_number.strip() if body.id_proof_number else None,
    )
    db.add(member)
    await db.flush()
    return JSONResponse(content=_member_dict(member), status_code=201)


@router.patch("/{flat_id}/members/{member_id}")
async def update_flat_member(
    flat_id: str,
    member_id: str,
    body: FlatMemberUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a flat member."""
    await _verify_flat_access(flat_id, current_user, db)
    try:
        mid = UUID(member_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid member_id")

    result = await db.execute(
        select(FlatMember).where(FlatMember.id == mid, FlatMember.flat_id == UUID(flat_id))
    )
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    if body.full_name is not None:
        member.full_name = body.full_name.strip()
    if body.phone is not None:
        member.phone = body.phone.strip() or None
    if body.relation is not None:
        member.relation = body.relation
    if body.date_of_birth is not None:
        member.date_of_birth = body.date_of_birth
    if body.id_proof_type is not None:
        member.id_proof_type = body.id_proof_type.strip() or None
    if body.id_proof_number is not None:
        member.id_proof_number = body.id_proof_number.strip() or None

    db.add(member)
    await db.flush()
    return JSONResponse(content=_member_dict(member))


@router.delete("/{flat_id}/members/{member_id}")
async def remove_flat_member(
    flat_id: str,
    member_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Soft-delete a flat member."""
    await _verify_flat_access(flat_id, current_user, db)
    try:
        mid = UUID(member_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid member_id")

    result = await db.execute(
        select(FlatMember).where(FlatMember.id == mid, FlatMember.flat_id == UUID(flat_id))
    )
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    member.is_active = False
    db.add(member)
    await db.flush()
    return JSONResponse(content={"ok": True})


# ──────────────── Data Migration ────────────────


@router.post("/migrate")
async def migrate_flat_numbers(
    current_user: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Backfill existing users' flat_number strings into proper Flat records.
    Idempotent — safe to run multiple times.
    """
    society_id = current_user.get("society_id")
    if not society_id:
        raise HTTPException(status_code=403, detail="No society context")
    sid = UUID(str(society_id))

    # Find users with building + flat_number but no flat_id
    result = await db.execute(
        select(User).where(
            User.society_id == sid,
            User.building_id.isnot(None),
            User.flat_number.isnot(None),
            User.flat_number != "",
            User.flat_id.is_(None),
        )
    )
    users = result.scalars().all()

    created_flats = 0
    updated_users = 0

    for user in users:
        flat_num = user.flat_number.strip()
        if not flat_num:
            continue

        # Find or create flat
        result = await db.execute(
            select(Flat).where(
                Flat.building_id == user.building_id,
                Flat.flat_number == flat_num,
            )
        )
        flat = result.scalar_one_or_none()

        if not flat:
            flat = Flat(
                building_id=user.building_id,
                flat_number=flat_num,
                occupancy_status="occupied",
            )
            db.add(flat)
            await db.flush()
            created_flats += 1
        else:
            if flat.occupancy_status == "vacant":
                flat.occupancy_status = "occupied"
                db.add(flat)

        user.flat_id = flat.id
        db.add(user)
        updated_users += 1

    await db.flush()
    log.info("flat_migration", society_id=str(sid), created_flats=created_flats, updated_users=updated_users)
    return JSONResponse(content={
        "created_flats": created_flats,
        "updated_users": updated_users,
    })
