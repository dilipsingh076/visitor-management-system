"""
Seed subscription plans and optionally link societies to plans.
Usage (from backend directory):
  python -m scripts.seed_subscriptions           - Seed plans only
  python -m scripts.seed_subscriptions --societies - Seed plans and assign Basic to societies without a subscription
"""
import asyncio
import sys
from datetime import datetime
from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

sys.path.insert(0, ".")

from app.core.database import AsyncSessionLocal
from app.models import Society
from app.models.subscription import SubscriptionPlan, Subscription, SubscriptionStatus


DEFAULT_PLANS = [
    {
        "name": "Basic",
        "code": "basic",
        "description": "Up to 50 residents, 500 visitors/month",
        "price": Decimal("999.00"),
        "interval": "monthly",
        "max_residents": 50,
        "max_visitors_per_month": 500,
        "features": '["Visitor management", "Basic reports"]',
        "is_active": True,
        "sort_order": 1,
    },
    {
        "name": "Standard",
        "code": "standard",
        "description": "Up to 200 residents, 2000 visitors/month",
        "price": Decimal("2499.00"),
        "interval": "monthly",
        "max_residents": 200,
        "max_visitors_per_month": 2000,
        "features": '["Visitor management", "Reports", "Blacklist", "Support"]',
        "is_active": True,
        "sort_order": 2,
    },
    {
        "name": "Premium",
        "code": "premium",
        "description": "Up to 500 residents, 5000 visitors/month",
        "price": Decimal("4999.00"),
        "interval": "monthly",
        "max_residents": 500,
        "max_visitors_per_month": 5000,
        "features": '["All Standard", "API access", "Priority support"]',
        "is_active": True,
        "sort_order": 3,
    },
    {
        "name": "Enterprise",
        "code": "enterprise",
        "description": "Unlimited residents and visitors",
        "price": Decimal("9999.00"),
        "interval": "monthly",
        "max_residents": None,
        "max_visitors_per_month": None,
        "features": '["All Premium", "Dedicated support", "Custom integrations"]',
        "is_active": True,
        "sort_order": 4,
    },
]


async def seed_plans(session: AsyncSession) -> int:
    """Create default subscription plans if they don't exist. Returns number created."""
    result = await session.execute(select(SubscriptionPlan).limit(1))
    if result.scalar_one_or_none():
        print("Subscription plans already exist; skipping plan seed.")
        return 0

    created = 0
    for p in DEFAULT_PLANS:
        plan = SubscriptionPlan(**p)
        session.add(plan)
        created += 1
        print(f"  Created plan: {p['name']} ({p['code']}) - Rs {p['price']}/{p['interval']}")
    await session.flush()
    return created


async def assign_basic_to_societies(session: AsyncSession) -> int:
    """Assign Basic plan to each society that has no active subscription. Returns number assigned."""
    result = await session.execute(select(SubscriptionPlan).where(SubscriptionPlan.code == "basic"))
    basic_plan = result.scalar_one_or_none()
    if not basic_plan:
        print("Basic plan not found; run seed without --societies first.")
        return 0

    result = await session.execute(select(Society))
    societies = result.scalars().all()
    result = await session.execute(
        select(Subscription.society_id).where(Subscription.status == SubscriptionStatus.ACTIVE.value)
    )
    subscribed_ids = {r[0] for r in result.all()}

    assigned = 0
    now = datetime.utcnow()
    for society in societies:
        if society.id in subscribed_ids:
            continue
        sub = Subscription(
            society_id=society.id,
            plan_id=basic_plan.id,
            status=SubscriptionStatus.ACTIVE.value,
            start_date=now,
            auto_renew=True,
        )
        session.add(sub)
        assigned += 1
        print(f"  Assigned Basic to society: {society.name} ({society.slug})")
    return assigned


async def main():
    with_societies = "--societies" in sys.argv

    async with AsyncSessionLocal() as session:
        print("Seeding subscription plans...")
        n_plans = await seed_plans(session)
        n_subs = 0
        if with_societies:
            print("\nAssigning Basic plan to societies without a subscription...")
            n_subs = await assign_basic_to_societies(session)
            if n_subs:
                print(f"Assigned Basic to {n_subs} societies.")

        if n_plans or n_subs:
            await session.commit()
            if n_plans:
                print(f"Created {n_plans} plans.")
        else:
            await session.rollback()
            if not n_plans:
                print("No plans created (already exist).")

    print("\nDone.")


if __name__ == "__main__":
    asyncio.run(main())
