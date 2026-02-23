# VMS Testing Guide

## Prerequisites

1. **Backend** running: `.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0`
2. **Frontend web** (optional): `npm run dev` in frontend-web
3. **Mobile web** (optional): `npm run dev` in mobile/VisitorManagementApp/web
4. **Auth**: Demo mode – use `Authorization: Bearer demo-token`

Base URL: `http://localhost:8000/api/v1`

---

## Walk-in → Approval → Check-in Flow

### Step 1: Guard registers walk-in

**API:** `POST /visitors/walkin`

```json
{
  "visitor_name": "John Doe",
  "visitor_phone": "9876543210",
  "purpose": "Delivery",
  "host_id": "00000000-0000-0000-0000-000000000002"
}
```

- **host_id** options:  
  - `00000000-0000-0000-0000-000000000001` – Demo Resident  
  - `00000000-0000-0000-0000-000000000002` – Rajesh Kumar  
  - `00000000-0000-0000-0000-000000000003` – Priya Sharma  

- Response includes `otp` – share with the visitor after approval.

### Step 2: Host approves

**API:** `PATCH /visitors/{visit_id}/approve`

- Get `visit_id` from Step 1 response.
- Host (or guard) approves via dashboard or API.
- After approval, visitor can use the OTP to check in.

### Step 3: Visitor checks in

**API:** `POST /checkin/otp`

```json
{
  "otp": "123456",
  "consent_given": true
}
```

- Use the OTP from the invite/walk-in response.
- `consent_given` must be `true` (DPDP).

---

## Testing All APIs

### 1. Health

```
GET /api/v1/health
```

### 2. Dashboard

```
GET /api/v1/dashboard/stats
```

### 3. Residents (for walk-in host selection)

```
GET /api/v1/residents
```

### 4. Invite

```
POST /api/v1/visitors/invite
{
  "visitor_name": "Jane",
  "visitor_phone": "9876543210",
  "purpose": "Meeting",
  "expected_arrival": "2026-02-19T14:00:00"
}
```

### 5. Walk-in

```
POST /api/v1/visitors/walkin
{
  "visitor_name": "John",
  "visitor_phone": "9876543210",
  "purpose": "Delivery",
  "host_id": "00000000-0000-0000-0000-000000000002"
}
```

### 6. List visits

```
GET /api/v1/visitors
GET /api/v1/visitors?status=pending
GET /api/v1/visitors?status=approved
GET /api/v1/visitors?status=checked_in
GET /api/v1/visitors?host_id=me
```

### 7. Approve visit

```
PATCH /api/v1/visitors/{visit_id}/approve
```

### 8. Check-in (OTP)

```
POST /api/v1/checkin/otp
{
  "otp": "123456",
  "consent_given": true
}
```

### 9. Check-in (QR)

```
POST /api/v1/checkin/qr
{
  "qr_code": "VMS-XXXXXXXXXXXX",
  "consent_given": true
}
```

### 10. Check-out

```
POST /api/v1/checkin/checkout
{
  "visit_id": "uuid-here"
}
```

### 11. Blacklist

```
GET /api/v1/blacklist
POST /api/v1/blacklist
POST /api/v1/blacklist/by-phone
DELETE /api/v1/blacklist/{visitor_id}
```

### 12. Notifications

```
GET /api/v1/notifications
GET /api/v1/notifications?unread_only=true
PATCH /api/v1/notifications/{id}/read
```

### 13. Muster export

```
GET /api/v1/dashboard/muster
GET /api/v1/dashboard/muster?format=csv
```

---

## Quick End-to-End Test (Walk-in)

1. **Guard:** Register walk-in  
   `POST /visitors/walkin` → note `id`, `otp`
2. **Resident:** Approve  
   `PATCH /visitors/{id}/approve`
3. **Visitor:** Check in  
   `POST /checkin/otp` with `otp` and `consent_given: true`
4. **Guard:** Check-out when visitor leaves  
   `POST /checkin/checkout` with `visit_id`
