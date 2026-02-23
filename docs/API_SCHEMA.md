# VMS API Schema

Canonical schema for web and mobile. Sync types from this document.

Base: `http://localhost:8000/api/v1`  
Auth: `Authorization: Bearer demo-token`

---

## Types (TypeScript)

```typescript
export type VisitStatus = "pending" | "approved" | "checked_in" | "checked_out" | "cancelled";

export interface Visit {
  id: string;
  visitor_id: string;
  host_id: string;
  host_name?: string;
  status: VisitStatus;
  purpose?: string;
  visitor_name: string;
  visitor_phone: string;
  expected_arrival?: string | null;
  actual_arrival?: string | null;
  actual_departure?: string | null;
  qr_code?: string | null;
  otp?: string | null;
  consent_given: boolean;
  is_walkin?: boolean;
  created_at: string;
  updated_at: string;
}

export interface VisitInviteRequest {
  visitor_name: string;
  visitor_phone: string;
  purpose?: string;
  visitor_email?: string;
  expected_arrival?: string;
}

export interface WalkInRequest {
  visitor_name: string;
  visitor_phone: string;
  purpose?: string;
  host_id: string;
}

export interface CheckInOtpRequest { otp: string; consent_given: boolean; }
export interface CheckInQrRequest { qr_code: string; consent_given: boolean; }
export interface CheckOutRequest { visit_id: string; }

export interface CheckInResponse {
  visit_id: string;
  status: string;
  checkin_time: string;
  photo_url?: string | null;
  message: string;
}

export interface BlacklistEntry {
  id: string;
  visitor_id: string;
  visitor_name: string;
  visitor_phone: string;
  reason: string;
  created_at: string;
}

export interface BlacklistAddRequest { visitor_id: string; reason: string; }
export interface BlacklistByPhoneRequest { visitor_phone: string; visitor_name: string; reason: string; }

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  extra_data?: string | null;
  created_at: string;
}

export interface Resident {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  flat_no?: string;
}

export interface DashboardStats {
  visitors_today: number;
  pending_approvals: number;
  checked_in: number;
}
```

---

## Endpoints

| Method | Path | Request | Response |
|--------|------|---------|----------|
| GET | /dashboard/stats | - | DashboardStats |
| GET | /dashboard/muster | ?format=csv | JSON or CSV |
| GET | /residents | - | Resident[] |
| GET | /visitors | ?status, ?host_id | Visit[] |
| GET | /visitors/:id | - | Visit |
| POST | /visitors/invite | VisitInviteRequest | Visit |
| POST | /visitors/walkin | WalkInRequest | Visit |
| PATCH | /visitors/:id/approve | - | Visit |
| POST | /checkin/otp | CheckInOtpRequest | CheckInResponse |
| POST | /checkin/qr | CheckInQrRequest | CheckInResponse |
| POST | /checkin/checkout | CheckOutRequest | CheckInResponse |
| GET | /blacklist | - | BlacklistEntry[] |
| POST | /blacklist | BlacklistAddRequest | { message } |
| POST | /blacklist/by-phone | BlacklistByPhoneRequest | { message } |
| DELETE | /blacklist/:visitor_id | - | { message } |
| GET | /notifications | ?unread_only | Notification[] |
| PATCH | /notifications/:id/read | - | { message } |
