"""
Pydantic schemas for subscription and billing.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from decimal import Decimal


# ============== Subscription Plans ==============

class SubscriptionPlanCreate(BaseModel):
    """Schema for creating a subscription plan."""
    name: str = Field(..., min_length=1, max_length=100)
    code: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = None
    price: Decimal = Field(default=Decimal("0"))
    interval: str = Field(default="monthly")  # monthly, quarterly, yearly
    max_residents: Optional[int] = None
    max_visitors_per_month: Optional[int] = None
    features: Optional[str] = None  # JSON array
    is_active: bool = True
    sort_order: int = 0


class SubscriptionPlanUpdate(BaseModel):
    """Schema for updating a subscription plan."""
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    interval: Optional[str] = None
    max_residents: Optional[int] = None
    max_visitors_per_month: Optional[int] = None
    features: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


class SubscriptionPlanResponse(BaseModel):
    """Schema for subscription plan response."""
    id: UUID
    name: str
    code: str
    description: Optional[str]
    price: Decimal
    interval: str
    max_residents: Optional[int]
    max_visitors_per_month: Optional[int]
    features: Optional[str]
    is_active: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============== Subscriptions ==============

class SubscriptionCreate(BaseModel):
    """Schema for creating a subscription."""
    society_id: UUID
    plan_id: UUID
    status: str = "pending"
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    trial_ends_at: Optional[datetime] = None
    auto_renew: bool = True


class SubscriptionUpdate(BaseModel):
    """Schema for updating a subscription."""
    plan_id: Optional[UUID] = None
    status: Optional[str] = None
    end_date: Optional[datetime] = None
    auto_renew: Optional[bool] = None
    cancellation_reason: Optional[str] = None


class SubscriptionResponse(BaseModel):
    """Schema for subscription response."""
    id: UUID
    society_id: UUID
    plan_id: Optional[UUID]
    status: str
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    trial_ends_at: Optional[datetime]
    cancelled_at: Optional[datetime]
    cancellation_reason: Optional[str]
    auto_renew: bool
    created_at: datetime
    updated_at: datetime
    plan: Optional[SubscriptionPlanResponse] = None

    class Config:
        from_attributes = True


# ============== Payments ==============

class PaymentCreate(BaseModel):
    """Schema for creating a payment."""
    subscription_id: Optional[UUID] = None
    society_id: UUID
    amount: Decimal
    currency: str = "INR"
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None


class PaymentUpdate(BaseModel):
    """Schema for updating a payment status."""
    status: str
    transaction_id: Optional[str] = None
    gateway_response: Optional[str] = None
    paid_at: Optional[datetime] = None
    refund_reason: Optional[str] = None


class PaymentResponse(BaseModel):
    """Schema for payment response."""
    id: UUID
    subscription_id: Optional[UUID]
    society_id: Optional[UUID]
    amount: Decimal
    currency: str
    status: str
    payment_method: Optional[str]
    transaction_id: Optional[str]
    paid_at: Optional[datetime]
    refunded_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============== Invoices ==============

class InvoiceCreate(BaseModel):
    """Schema for creating an invoice."""
    society_id: UUID
    payment_id: Optional[UUID] = None
    amount: Decimal
    tax_amount: Decimal = Decimal("0")
    total_amount: Decimal
    currency: str = "INR"
    billing_name: Optional[str] = None
    billing_address: Optional[str] = None
    billing_email: Optional[str] = None
    notes: Optional[str] = None
    due_date: Optional[datetime] = None


class InvoiceResponse(BaseModel):
    """Schema for invoice response."""
    id: UUID
    invoice_number: str
    society_id: Optional[UUID]
    payment_id: Optional[UUID]
    amount: Decimal
    tax_amount: Optional[Decimal]
    total_amount: Decimal
    currency: str
    status: str
    billing_name: Optional[str]
    billing_address: Optional[str]
    billing_email: Optional[str]
    notes: Optional[str]
    due_date: Optional[datetime]
    paid_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True
