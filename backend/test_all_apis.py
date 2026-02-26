#!/usr/bin/env python
"""
Test all VMS APIs. Run with backend started:
  venv\\Scripts\\python.exe test_all_apis.py
"""
import httpx

BASE = "http://localhost:8000/api/v1"
HEADERS = {"Authorization": "Bearer demo-token", "Content-Type": "application/json"}
HOST_ID = "00000000-0000-0000-0000-000000000002"  # Rajesh Kumar


def test(name: str, method: str, path: str, **kwargs):
    url = f"{BASE}{path}"
    r = httpx.request(method, url, headers=HEADERS, timeout=10, **kwargs)
    ok = 200 <= r.status_code < 300
    print(f"{'[OK]' if ok else '[FAIL]'} {name}: {r.status_code}")
    if not ok and r.text:
        print(f"  {r.text[:200]}")
    return r, ok


def main():
    print("Testing VMS APIs...\n")

    # 0. Register Society (no auth; use unique email each run or 400 if exists)
    import uuid
    unique = uuid.uuid4().hex[:8]
    r0, ok0 = test(
        "POST /auth/register-society",
        "POST",
        "/auth/register-society",
        headers={"Content-Type": "application/json"},
        json={
            "society_name": f"Test Society {unique}",
            "address": "123 Test St",
            "city": "Mumbai",
            "state": "Maharashtra",
            "pincode": "400001",
            "country": "India",
            "contact_email": f"contact-{unique}@example.com",
            "contact_phone": "9876543210",
            "registration_number": "REG123",
            "society_type": "cooperative_housing",
            "registration_year": "2024",
            "email": f"admin-{unique}@example.com",
            "password": "TestPass123!",
            "full_name": "Test Admin",
            "phone": "9876543210",
        },
    )
    if not ok0 and r0.text:
        print(f"  (Use unique email/society name if 400) {r0.text[:300]}")

    # 1. Health
    test("GET /health", "GET", "/health")

    # 2. Dashboard
    test("GET /dashboard/stats", "GET", "/dashboard/stats")

    # 3. Residents
    test("GET /residents", "GET", "/residents")

    # 4. Walk-in
    r, ok = test("POST /visitors/walkin", "POST", "/visitors/walkin", json={
        "visitor_name": "Test Visitor",
        "visitor_phone": "9876543210",
        "purpose": "API Test",
        "host_id": HOST_ID,
    })
    visit_id = None
    otp = None
    if ok and r.json():
        visit_id = r.json().get("id")
        otp = r.json().get("otp")

    # 5. List visits
    test("GET /visitors", "GET", "/visitors")
    test("GET /visitors?status=pending", "GET", "/visitors?status=pending")

    # 6. Approve (if we have visit_id)
    if visit_id:
        test("PATCH /visitors/:id/approve", "PATCH", f"/visitors/{visit_id}/approve")

    # 7. Check-in OTP (if we have otp)
    if otp:
        test("POST /checkin/otp", "POST", "/checkin/otp", json={"otp": otp, "consent_given": True})

    # 8. List checked-in
    r2, _ = test("GET /visitors?status=checked_in", "GET", "/visitors?status=checked_in")
    if r2.json() and len(r2.json()) > 0:
        vid = r2.json()[0].get("id")
        if vid:
            test("POST /checkin/checkout", "POST", "/checkin/checkout", json={"visit_id": vid})

    # 9. Invite
    test("POST /visitors/invite", "POST", "/visitors/invite", json={
        "visitor_name": "Invite Test",
        "visitor_phone": "9123456789",
        "purpose": "Meeting",
    })

    # 10. Blacklist
    test("GET /blacklist", "GET", "/blacklist")

    # 11. Notifications
    test("GET /notifications", "GET", "/notifications")

    # 12. Muster
    test("GET /dashboard/muster", "GET", "/dashboard/muster")

    print("\nDone.")


if __name__ == "__main__":
    main()
