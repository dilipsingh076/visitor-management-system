#!/usr/bin/env python
"""
Debug script: Test walkin endpoint against a running backend.
Run: 1) Fully STOP any existing uvicorn (Ctrl+C), then start fresh: python -m uvicorn app.main:app --reload --host 0.0.0.0
     2) Run this: python debug_walkin.py
"""
import httpx

URL = "http://localhost:8000/api/v1/visitors/walkin"
PAYLOAD = {
    "visitor_name": "test",
    "visitor_phone": "9876543210",
    "purpose": "delivery",
    "host_id": "00000000-0000-0000-0000-000000000002",
}
HEADERS = {
    "Authorization": "Bearer demo-token",
    "Content-Type": "application/json",
    "Origin": "http://localhost:8083",
}

def main():
    print("Testing walkin endpoint...")
    try:
        r = httpx.post(URL, json=PAYLOAD, headers=HEADERS, timeout=10)
        print("Status:", r.status_code)
        print("Headers:", dict(r.headers))
        print("Body:", r.text[:500] if r.text else "(empty)")
    except Exception as e:
        print("Error:", type(e).__name__, str(e))

if __name__ == "__main__":
    main()
