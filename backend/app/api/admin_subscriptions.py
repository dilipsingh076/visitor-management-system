"""
Platform Admin Subscription & Billing API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import Optional, List
from datetime import datetime
from uuid import UUID
import uuid

from app.core.dependencies import get_db, get_current_user_id
from app.core.rbac import log_admin_action
from app.api.admin import require_platform_admin
from app.models import Society
from app.models.subscription import SubscriptionPlan, Subscription, Payment, Invoice
from app.schemas.subscription import (
    SubscriptionPlanCreate, SubscriptionPlanUpdate, SubscriptionPlanResponse,
    SubscriptionCreate, SubscriptionUpdate, SubscriptionResponse,
    PaymentCreate, PaymentUpdate, PaymentResponse,
    InvoiceCreate, InvoiceResponse,
)

router = APIRouter()


# ============== Subscription Plans ==============

@router.get("/plans", response_model=List[SubscriptionPlanResponse])
async def list_subscription_plans(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    include_inactive: bool = False,
):
    """List all subscription plans."""
    query = select(SubscriptionPlan).order_by(SubscriptionPlan.sort_order)
    if not include_inactive:
        query = query.where(SubscriptionPlan.is_active == True)
    result = await db.execute(query)
    plans = result.scalars().all()
    return [SubscriptionPlanResponse.model_validate(p) for p in plans]


@router.post("/plans", response_model=SubscriptionPlanResponse)
async def create_subscription_plan(
    plan: SubscriptionPlanCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Create a new subscription plan."""
    # Check for duplicate code
    existing = await db.execute(
        select(SubscriptionPlan).where(SubscriptionPlan.code == plan.code)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Plan code already exists")

    new_plan = SubscriptionPlan(**plan.model_dump())
    db.add(new_plan)
    await db.commit()
    await db.refresh(new_plan)

    await log_admin_action(
        db, current_user_id, current_user,
        "create_subscription_plan", request.url.path, request.method,
        {"plan_id": str(new_plan.id), "name": new_plan.name},
    )

    return SubscriptionPlanResponse.model_validate(new_plan)


@router.get("/plans/{plan_id}", response_model=SubscriptionPlanResponse)
async def get_subscription_plan(
    plan_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
):
    """Get a subscription plan by ID."""
    result = await db.execute(select(SubscriptionPlan).where(SubscriptionPlan.id == plan_id))
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return SubscriptionPlanResponse.model_validate(plan)


@router.patch("/plans/{plan_id}", response_model=SubscriptionPlanResponse)
async def update_subscription_plan(
    plan_id: UUID,
    update: SubscriptionPlanUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Update a subscription plan."""
    result = await db.execute(select(SubscriptionPlan).where(SubscriptionPlan.id == plan_id))
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    update_data = update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(plan, key, value)
    plan.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(plan)

    await log_admin_action(
        db, current_user_id, current_user,
        "update_subscription_plan", request.url.path, request.method,
        {"plan_id": str(plan_id), "updates": update_data},
    )

    return SubscriptionPlanResponse.model_validate(plan)


@router.delete("/plans/{plan_id}")
async def delete_subscription_plan(
    plan_id: UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Soft delete (deactivate) a subscription plan."""
    result = await db.execute(select(SubscriptionPlan).where(SubscriptionPlan.id == plan_id))
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    plan.is_active = False
    plan.updated_at = datetime.utcnow()
    await db.commit()

    await log_admin_action(
        db, current_user_id, current_user,
        "delete_subscription_plan", request.url.path, request.method,
        {"plan_id": str(plan_id)},
    )

    return {"message": "Plan deactivated", "plan_id": str(plan_id)}


# ============== Subscriptions ==============

@router.get("/subscriptions")
async def list_subscriptions(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    society_id: Optional[UUID] = None,
    status: Optional[str] = None,
):
    """List all subscriptions."""
    query = select(Subscription)
    count_query = select(func.count(Subscription.id))

    if society_id:
        query = query.where(Subscription.society_id == society_id)
        count_query = count_query.where(Subscription.society_id == society_id)

    if status:
        query = query.where(Subscription.status == status)
        count_query = count_query.where(Subscription.status == status)

    total = await db.scalar(count_query)

    offset = (page - 1) * page_size
    query = query.order_by(desc(Subscription.created_at)).offset(offset).limit(page_size)
    result = await db.execute(query)
    subscriptions = result.scalars().all()

    # Get society and plan names
    society_ids = set(s.society_id for s in subscriptions)
    plan_ids = set(s.plan_id for s in subscriptions if s.plan_id)

    society_map = {}
    if society_ids:
        soc_result = await db.execute(select(Society).where(Society.id.in_(society_ids)))
        for s in soc_result.scalars().all():
            society_map[s.id] = s.name

    plan_map = {}
    if plan_ids:
        plan_result = await db.execute(select(SubscriptionPlan).where(SubscriptionPlan.id.in_(plan_ids)))
        for p in plan_result.scalars().all():
            plan_map[p.id] = p.name

    items = []
    for sub in subscriptions:
        item = SubscriptionResponse.model_validate(sub)
        item_dict = item.model_dump()
        item_dict["society_name"] = society_map.get(sub.society_id)
        item_dict["plan_name"] = plan_map.get(sub.plan_id) if sub.plan_id else None
        items.append(item_dict)

    return {
        "items": items,
        "total": total or 0,
        "page": page,
        "page_size": page_size,
        "total_pages": (total or 0 + page_size - 1) // page_size if total else 0,
    }


@router.post("/subscriptions", response_model=SubscriptionResponse)
async def create_subscription(
    subscription: SubscriptionCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Create a subscription for a society."""
    # Verify society exists
    society = await db.execute(select(Society).where(Society.id == subscription.society_id))
    if not society.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Society not found")

    # Verify plan exists
    plan = await db.execute(select(SubscriptionPlan).where(SubscriptionPlan.id == subscription.plan_id))
    if not plan.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Plan not found")

    new_subscription = Subscription(**subscription.model_dump())
    db.add(new_subscription)
    await db.commit()
    await db.refresh(new_subscription)

    await log_admin_action(
        db, current_user_id, current_user,
        "create_subscription", request.url.path, request.method,
        {"subscription_id": str(new_subscription.id), "society_id": str(subscription.society_id)},
    )

    return SubscriptionResponse.model_validate(new_subscription)


@router.patch("/subscriptions/{subscription_id}", response_model=SubscriptionResponse)
async def update_subscription(
    subscription_id: UUID,
    update: SubscriptionUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Update a subscription."""
    result = await db.execute(select(Subscription).where(Subscription.id == subscription_id))
    subscription = result.scalar_one_or_none()
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")

    update_data = update.model_dump(exclude_unset=True)

    # Handle cancellation
    if update_data.get("status") == "cancelled" and subscription.status != "cancelled":
        update_data["cancelled_at"] = datetime.utcnow()

    for key, value in update_data.items():
        setattr(subscription, key, value)
    subscription.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(subscription)

    await log_admin_action(
        db, current_user_id, current_user,
        "update_subscription", request.url.path, request.method,
        {"subscription_id": str(subscription_id), "updates": update_data},
    )

    return SubscriptionResponse.model_validate(subscription)


# ============== Payments ==============

@router.get("/payments")
async def list_payments(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    society_id: Optional[UUID] = None,
    status: Optional[str] = None,
):
    """List all payments."""
    query = select(Payment)
    count_query = select(func.count(Payment.id))

    if society_id:
        query = query.where(Payment.society_id == society_id)
        count_query = count_query.where(Payment.society_id == society_id)

    if status:
        query = query.where(Payment.status == status)
        count_query = count_query.where(Payment.status == status)

    total = await db.scalar(count_query)

    offset = (page - 1) * page_size
    query = query.order_by(desc(Payment.created_at)).offset(offset).limit(page_size)
    result = await db.execute(query)
    payments = result.scalars().all()

    # Get society names
    society_ids = set(p.society_id for p in payments if p.society_id)
    society_map = {}
    if society_ids:
        soc_result = await db.execute(select(Society).where(Society.id.in_(society_ids)))
        for s in soc_result.scalars().all():
            society_map[s.id] = s.name

    items = []
    for payment in payments:
        item = PaymentResponse.model_validate(payment).model_dump()
        item["society_name"] = society_map.get(payment.society_id) if payment.society_id else None
        items.append(item)

    return {
        "items": items,
        "total": total or 0,
        "page": page,
        "page_size": page_size,
        "total_pages": (total or 0 + page_size - 1) // page_size if total else 0,
    }


@router.post("/payments", response_model=PaymentResponse)
async def create_payment(
    payment: PaymentCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Record a payment."""
    new_payment = Payment(**payment.model_dump())
    db.add(new_payment)
    await db.commit()
    await db.refresh(new_payment)

    await log_admin_action(
        db, current_user_id, current_user,
        "create_payment", request.url.path, request.method,
        {"payment_id": str(new_payment.id), "amount": str(new_payment.amount)},
    )

    return PaymentResponse.model_validate(new_payment)


@router.patch("/payments/{payment_id}", response_model=PaymentResponse)
async def update_payment(
    payment_id: UUID,
    update: PaymentUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Update payment status."""
    result = await db.execute(select(Payment).where(Payment.id == payment_id))
    payment = result.scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    update_data = update.model_dump(exclude_unset=True)

    # Handle status changes
    if update_data.get("status") == "completed" and payment.status != "completed":
        update_data["paid_at"] = datetime.utcnow()
    elif update_data.get("status") == "refunded" and payment.status != "refunded":
        update_data["refunded_at"] = datetime.utcnow()

    for key, value in update_data.items():
        setattr(payment, key, value)
    payment.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(payment)

    await log_admin_action(
        db, current_user_id, current_user,
        "update_payment", request.url.path, request.method,
        {"payment_id": str(payment_id), "updates": update_data},
    )

    return PaymentResponse.model_validate(payment)


# ============== Invoices ==============

@router.get("/invoices")
async def list_invoices(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    society_id: Optional[UUID] = None,
    status: Optional[str] = None,
):
    """List all invoices."""
    query = select(Invoice)
    count_query = select(func.count(Invoice.id))

    if society_id:
        query = query.where(Invoice.society_id == society_id)
        count_query = count_query.where(Invoice.society_id == society_id)

    if status:
        query = query.where(Invoice.status == status)
        count_query = count_query.where(Invoice.status == status)

    total = await db.scalar(count_query)

    offset = (page - 1) * page_size
    query = query.order_by(desc(Invoice.created_at)).offset(offset).limit(page_size)
    result = await db.execute(query)
    invoices = result.scalars().all()

    items = [InvoiceResponse.model_validate(inv) for inv in invoices]

    return {
        "items": items,
        "total": total or 0,
        "page": page,
        "page_size": page_size,
        "total_pages": (total or 0 + page_size - 1) // page_size if total else 0,
    }


@router.post("/invoices", response_model=InvoiceResponse)
async def create_invoice(
    invoice: InvoiceCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Generate an invoice."""
    # Generate invoice number
    invoice_count = await db.scalar(select(func.count(Invoice.id)))
    invoice_number = f"INV-{datetime.utcnow().strftime('%Y%m')}-{(invoice_count or 0) + 1:05d}"

    new_invoice = Invoice(
        invoice_number=invoice_number,
        **invoice.model_dump(),
    )
    db.add(new_invoice)
    await db.commit()
    await db.refresh(new_invoice)

    await log_admin_action(
        db, current_user_id, current_user,
        "create_invoice", request.url.path, request.method,
        {"invoice_id": str(new_invoice.id), "invoice_number": invoice_number},
    )

    return InvoiceResponse.model_validate(new_invoice)
