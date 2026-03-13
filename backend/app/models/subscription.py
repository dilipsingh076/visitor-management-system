"""
Subscription and billing models for SaaS platform.
"""
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, Numeric, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.core.database import Base
from app.core.db_types import GUID


class PlanInterval(str, enum.Enum):
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"


class SubscriptionStatus(str, enum.Enum):
    ACTIVE = "active"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    PENDING = "pending"
    TRIAL = "trial"


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class SubscriptionPlan(Base):
    """
    Subscription plans available for societies (e.g. Basic, Pro, Enterprise).
    """
    __tablename__ = "subscription_plans"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False, unique=True, index=True)
    code = Column(String(50), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    price = Column(Numeric(10, 2), nullable=False, default=0)
    interval = Column(String(20), nullable=False, default=PlanInterval.MONTHLY.value)
    max_residents = Column(Integer, nullable=True)
    max_visitors_per_month = Column(Integer, nullable=True)
    features = Column(Text, nullable=True)  # JSON array of feature strings
    is_active = Column(Boolean, default=True, nullable=False)
    sort_order = Column(Integer, nullable=True, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    subscriptions = relationship("Subscription", back_populates="plan")

    def __repr__(self):
        return f"<SubscriptionPlan(id={self.id}, name={self.name}, price={self.price})>"


class Subscription(Base):
    """
    Active subscription linking a society to a plan.
    """
    __tablename__ = "subscriptions"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    society_id = Column(GUID(), ForeignKey("societies.id", ondelete="CASCADE"), nullable=False, index=True)
    plan_id = Column(GUID(), ForeignKey("subscription_plans.id", ondelete="SET NULL"), nullable=True, index=True)
    status = Column(String(20), nullable=False, default=SubscriptionStatus.PENDING.value, index=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    trial_ends_at = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    cancellation_reason = Column(Text, nullable=True)
    auto_renew = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    plan = relationship("SubscriptionPlan", back_populates="subscriptions")
    payments = relationship("Payment", back_populates="subscription")

    def __repr__(self):
        return f"<Subscription(id={self.id}, society_id={self.society_id}, status={self.status})>"


class Payment(Base):
    """
    Payment records for subscriptions.
    """
    __tablename__ = "payments"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    subscription_id = Column(GUID(), ForeignKey("subscriptions.id", ondelete="SET NULL"), nullable=True, index=True)
    society_id = Column(GUID(), ForeignKey("societies.id", ondelete="SET NULL"), nullable=True, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(10), nullable=False, default="INR")
    status = Column(String(20), nullable=False, default=PaymentStatus.PENDING.value, index=True)
    payment_method = Column(String(50), nullable=True)
    transaction_id = Column(String(255), nullable=True, unique=True, index=True)
    gateway_response = Column(Text, nullable=True)  # JSON
    paid_at = Column(DateTime, nullable=True)
    refunded_at = Column(DateTime, nullable=True)
    refund_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    subscription = relationship("Subscription", back_populates="payments")

    def __repr__(self):
        return f"<Payment(id={self.id}, amount={self.amount}, status={self.status})>"


class Invoice(Base):
    """
    Invoices generated for payments.
    """
    __tablename__ = "invoices"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    invoice_number = Column(String(50), unique=True, nullable=False, index=True)
    society_id = Column(GUID(), ForeignKey("societies.id", ondelete="SET NULL"), nullable=True, index=True)
    payment_id = Column(GUID(), ForeignKey("payments.id", ondelete="SET NULL"), nullable=True, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    tax_amount = Column(Numeric(10, 2), nullable=True, default=0)
    total_amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(10), nullable=False, default="INR")
    status = Column(String(20), nullable=False, default="draft", index=True)  # draft, sent, paid, cancelled
    billing_name = Column(String(255), nullable=True)
    billing_address = Column(Text, nullable=True)
    billing_email = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    due_date = Column(DateTime, nullable=True)
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Invoice(id={self.id}, invoice_number={self.invoice_number}, total={self.total_amount})>"
