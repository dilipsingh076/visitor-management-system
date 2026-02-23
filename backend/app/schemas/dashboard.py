"""Dashboard schemas."""
from pydantic import BaseModel


class DashboardStatsResponse(BaseModel):
    """Dashboard statistics."""
    visitors_today: int
    pending_approvals: int
    checked_in: int
