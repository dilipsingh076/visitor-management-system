"""Visit-related constants."""

VISIT_STATUSES = ["pending", "approved", "checked_in", "checked_out", "cancelled"]
OTP_LENGTH = 6
OTP_EXPIRE_MINUTES = 30
QR_PREFIX = "VMS"
# Time validity: allow check-in within ARRIVAL_WINDOW_MINUTES before/after expected_arrival
ARRIVAL_WINDOW_MINUTES = 60
