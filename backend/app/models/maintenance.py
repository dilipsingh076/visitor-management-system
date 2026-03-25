"""
Maintenance bill model for tracking flat-level maintenance dues.
"""
from sqlalchemy import Column, String, Boolean, DateTime, Date, ForeignKey, Numeric, Text
from datetime import datetime
import uuid

from app.core.database import Base
from app.core.db_types import GUID


class MaintenanceBill(Base):
    """
    Monthly/periodic maintenance bills for each flat.
    Created by committee, viewed by flat owner.
    """
    __tablename__ = "maintenance_bills"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    society_id = Column(GUID(), ForeignKey("societies.id", ondelete="CASCADE"), nullable=False, index=True)
    flat_id = Column(GUID(), ForeignKey("flats.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    due_date = Column(Date, nullable=False)
    period = Column(String(50), nullable=False)  # e.g. "March 2026", "Q1 2026"
    description = Column(Text, nullable=True)
    status = Column(String(30), nullable=False, default="pending", index=True)  # pending, paid, overdue
    paid_date = Column(Date, nullable=True)
    payment_method = Column(String(50), nullable=True)  # cash, upi, bank_transfer, cheque
    payment_reference = Column(String(255), nullable=True)
    created_by = Column(GUID(), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<MaintenanceBill(id={self.id}, flat_id={self.flat_id}, period={self.period}, status={self.status})>"
