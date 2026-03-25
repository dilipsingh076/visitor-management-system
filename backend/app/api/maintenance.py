"""
Maintenance Bills API: committee creates bills, residents view their own.
"""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from app.core.dependencies import get_db, get_current_user, get_current_admin
from app.models.maintenance import MaintenanceBill
from app.models.society import Flat, Building
from app.models.user import User
from app.schemas.maintenance import MaintenanceBillCreate, MaintenanceBillBulkCreate, MaintenanceBillUpdate

router = APIRouter()


def _bill_dict(b: MaintenanceBill, flat_number: str | None = None) -> dict:
    return {
        "id": str(b.id),
        "society_id": str(b.society_id),
        "flat_id": str(b.flat_id),
        "flat_number": flat_number,
        "amount": float(b.amount),
        "due_date": b.due_date.isoformat() if b.due_date else None,
        "period": b.period,
        "description": b.description,
        "status": b.status,
        "paid_date": b.paid_date.isoformat() if b.paid_date else None,
        "payment_method": b.payment_method,
        "payment_reference": b.payment_reference,
        "created_at": b.created_at.isoformat() if b.created_at else None,
    }


# ──────────────── Resident endpoints ────────────────


@router.get("/my-bills")
async def my_bills(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List maintenance bills for the current user's flat."""
    user_id = current_user.get("user_id") or current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    result = await db.execute(select(User).where(User.id == UUID(str(user_id))))
    user = result.scalar_one_or_none()
    if not user or not user.flat_id:
        return JSONResponse(content=[])

    result = await db.execute(
        select(MaintenanceBill)
        .where(MaintenanceBill.flat_id == user.flat_id)
        .order_by(desc(MaintenanceBill.due_date))
    )
    bills = result.scalars().all()

    # Get flat number
    flat_result = await db.execute(select(Flat).where(Flat.id == user.flat_id))
    flat = flat_result.scalar_one_or_none()
    flat_number = flat.flat_number if flat else None

    return JSONResponse(content=[_bill_dict(b, flat_number) for b in bills])


@router.get("/my-summary")
async def my_summary(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get maintenance summary for the current user's flat."""
    user_id = current_user.get("user_id") or current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    result = await db.execute(select(User).where(User.id == UUID(str(user_id))))
    user = result.scalar_one_or_none()
    if not user or not user.flat_id:
        return JSONResponse(content={"total_due": 0, "total_paid": 0, "pending_count": 0, "overdue_count": 0})

    base = MaintenanceBill.flat_id == user.flat_id
    total_due = await db.scalar(
        select(func.coalesce(func.sum(MaintenanceBill.amount), 0))
        .where(base, MaintenanceBill.status.in_(["pending", "overdue"]))
    )
    total_paid = await db.scalar(
        select(func.coalesce(func.sum(MaintenanceBill.amount), 0))
        .where(base, MaintenanceBill.status == "paid")
    )
    pending_count = await db.scalar(
        select(func.count(MaintenanceBill.id)).where(base, MaintenanceBill.status == "pending")
    )
    overdue_count = await db.scalar(
        select(func.count(MaintenanceBill.id)).where(base, MaintenanceBill.status == "overdue")
    )

    return JSONResponse(content={
        "total_due": float(total_due or 0),
        "total_paid": float(total_paid or 0),
        "pending_count": pending_count or 0,
        "overdue_count": overdue_count or 0,
    })


# ──────────────── Admin endpoints ────────────────


@router.get("/")
async def list_bills(
    building_id: str | None = Query(None),
    flat_id: str | None = Query(None),
    status: str | None = Query(None),
    current_user: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """List maintenance bills (admin). Filter by building, flat, or status."""
    society_id = current_user.get("society_id")
    if not society_id:
        raise HTTPException(status_code=403, detail="No society context")

    query = (
        select(MaintenanceBill, Flat.flat_number)
        .join(Flat, MaintenanceBill.flat_id == Flat.id)
        .where(MaintenanceBill.society_id == UUID(str(society_id)))
    )

    if building_id:
        query = query.where(Flat.building_id == UUID(building_id))
    if flat_id:
        query = query.where(MaintenanceBill.flat_id == UUID(flat_id))
    if status:
        query = query.where(MaintenanceBill.status == status)

    query = query.order_by(desc(MaintenanceBill.due_date), Flat.flat_number)
    result = await db.execute(query)
    rows = result.all()
    return JSONResponse(content=[_bill_dict(b, fn) for b, fn in rows])


@router.post("/")
async def create_bill(
    body: MaintenanceBillCreate,
    current_user: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Create a maintenance bill for a single flat."""
    society_id = current_user.get("society_id")
    if not society_id:
        raise HTTPException(status_code=403, detail="No society context")

    user_id = current_user.get("user_id") or current_user.get("sub")

    bill = MaintenanceBill(
        society_id=UUID(str(society_id)),
        flat_id=body.flat_id,
        amount=body.amount,
        due_date=body.due_date,
        period=body.period,
        description=body.description,
        status="pending",
        created_by=UUID(str(user_id)) if user_id else None,
    )
    db.add(bill)
    await db.flush()

    # Get flat number
    flat_result = await db.execute(select(Flat).where(Flat.id == body.flat_id))
    flat = flat_result.scalar_one_or_none()

    return JSONResponse(content=_bill_dict(bill, flat.flat_number if flat else None), status_code=201)


@router.post("/bulk")
async def bulk_create_bills(
    body: MaintenanceBillBulkCreate,
    current_user: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Create maintenance bills for all occupied flats in a building."""
    society_id = current_user.get("society_id")
    if not society_id:
        raise HTTPException(status_code=403, detail="No society context")

    user_id = current_user.get("user_id") or current_user.get("sub")
    sid = UUID(str(society_id))

    # Get all occupied flats in building
    result = await db.execute(
        select(Flat).where(
            Flat.building_id == body.building_id,
            Flat.is_active == True,
            Flat.occupancy_status == "occupied",
        )
    )
    flats = result.scalars().all()

    created = 0
    skipped = 0
    for flat in flats:
        # Check if bill already exists for this flat + period
        exists = await db.scalar(
            select(func.count(MaintenanceBill.id)).where(
                MaintenanceBill.flat_id == flat.id,
                MaintenanceBill.period == body.period,
            )
        )
        if exists:
            skipped += 1
            continue

        bill = MaintenanceBill(
            society_id=sid,
            flat_id=flat.id,
            amount=body.amount,
            due_date=body.due_date,
            period=body.period,
            description=body.description,
            status="pending",
            created_by=UUID(str(user_id)) if user_id else None,
        )
        db.add(bill)
        created += 1

    await db.flush()
    return JSONResponse(content={"created": created, "skipped": skipped}, status_code=201)


@router.patch("/{bill_id}")
async def update_bill(
    bill_id: str,
    body: MaintenanceBillUpdate,
    current_user: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update a maintenance bill (mark as paid, change amount, etc.)."""
    try:
        bid = UUID(bill_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid bill_id")

    result = await db.execute(select(MaintenanceBill).where(MaintenanceBill.id == bid))
    bill = result.scalar_one_or_none()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    if body.amount is not None:
        bill.amount = body.amount
    if body.due_date is not None:
        bill.due_date = body.due_date
    if body.period is not None:
        bill.period = body.period
    if body.description is not None:
        bill.description = body.description
    if body.status is not None:
        bill.status = body.status
    if body.paid_date is not None:
        bill.paid_date = body.paid_date
    if body.payment_method is not None:
        bill.payment_method = body.payment_method
    if body.payment_reference is not None:
        bill.payment_reference = body.payment_reference

    bill.updated_at = datetime.utcnow()
    db.add(bill)
    await db.flush()

    flat_result = await db.execute(select(Flat).where(Flat.id == bill.flat_id))
    flat = flat_result.scalar_one_or_none()

    return JSONResponse(content=_bill_dict(bill, flat.flat_number if flat else None))
