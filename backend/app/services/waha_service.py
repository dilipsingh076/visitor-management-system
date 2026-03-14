"""WhatsApp (WAHA) integration - optional, non-blocking."""
import httpx
import structlog
from typing import Optional

from app.core.config import settings

logger = structlog.get_logger()


def _normalize_phone(phone: str) -> str:
    """Convert to WAHA chatId format: 919876543210@c.us (no +)"""
    digits = "".join(c for c in phone if c.isdigit())
    if digits.startswith("0"):
        digits = "91" + digits[1:]  # India: assume +91
    elif len(digits) == 10:
        digits = "91" + digits
    return f"{digits}@c.us"


async def send_invite_whatsapp(phone: str, visitor_name: str, otp: str, qr_code: Optional[str] = None) -> bool:
    """
    Send invite message via WAHA. Non-blocking; logs and returns False on failure.
    Set WAHA_API_URL in env (e.g. http://localhost:3001/api) to enable.
    """
    url = (settings.WAHA_API_URL or "").rstrip("/")
    if not url:
        return False

    chat_id = _normalize_phone(phone)

    # Prefer QR link that opens our shared QR page in the browser.
    qr_link: Optional[str] = None
    if qr_code:
        base = (settings.FRONTEND_BASE_URL or "").rstrip("/")
        if base:
            qr_link = f"{base}/qr/{qr_code}"

    lines = [f"Visitor pass: {visitor_name}"]
    if qr_link:
        lines.append(f"Open your QR pass:\n{qr_link}")
    if otp:
        lines.append(f"OTP (fallback): {otp}")
        lines.append("Share this with security if QR is not working.")

    text = "\n\n".join(lines)

    payload = {
        "session": "default",
        "chatId": chat_id,
        "text": text,
    }
    headers = {}
    if settings.WAHA_API_KEY:
        headers["X-Api-Key"] = settings.WAHA_API_KEY

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.post(f"{url}/sendText", json=payload, headers=headers or None)
            if r.is_success:
                logger.info("WhatsApp invite sent", phone=phone, visitor=visitor_name)
                return True
            logger.warning("WAHA send failed", status=r.status_code, body=r.text[:200])
            return False
    except Exception as e:
        logger.warning("WAHA send error", error=str(e))
        return False
