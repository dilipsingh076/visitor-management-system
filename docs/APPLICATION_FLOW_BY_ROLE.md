# Complete Application Flow (Role-Based)

This document describes the **end-to-end application flow** as designed so far, **based on the roles** defined in the backend and enforced in the frontend.

---

## 1. Roles (Backend)

| Role | Description | How assigned |
|------|-------------|--------------|
| **chairman** | Society head; full control (users, buildings, blacklist, reports) | Committee only (or first admin at register-society) |
| **secretary** | Day-to-day operations (users, visitors, reports) | Committee only |
| **treasurer** | Society oversight (users, blacklist, reports) | Committee only |
| **resident** | Invite visitors, approve/reject own invites | **Signup only** (join existing society) |
| **guard** | Check-in, walk-in, blacklist, muster at gate | **Signup only** or committee |
| **platform_admin** | Manage all societies; platform-level | Backend / super-admin only |

- **Committee** = Chairman, Secretary, Treasurer (society-level admin).
- **Resident** and **Guard** are the only roles users can **choose at signup** when joining an existing society.
- Committee roles are **assigned by Chairman/committee** via **Society Management** (admin/users); they cannot be self-selected at signup.

---

## 2. High-Level Application Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PUBLIC                                                                     │
│  /  →  Home  →  Get Started / How it works / Features / Contact / Login     │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    ▼                                   ▼
┌───────────────────────────────┐     ┌───────────────────────────────────────┐
│  LOGIN                        │     │  SIGNUP (join society)                │
│  /login                       │     │  /signup                               │
│  Email + password → JWT       │     │  Society code → Building (resident)   │
│  (or Demo login)             │     │  Role: Resident | Guard                │
└───────────────────────────────┘     └───────────────────────────────────────┘
                    │                                   │
                    └─────────────────┬─────────────────┘
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  REGISTER SOCIETY (no account yet)                                           │
│  /register-society                                                            │
│  Society name, slug, contact, buildings + first admin (Chairman)             │
│  → Creates society + buildings + first user (chairman) + JWT                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  AUTHENTICATED APP (JWT in cookie / localStorage)                             │
│  Header: Dashboard | Visitors | Check-in | Walk-in | Guard | Blacklist |     │
│          Management | Platform (role-dependent)                               │
│                                                                               │
│  DASHBOARD /  →  Role-based: Committee | Guard | Resident | Platform Admin   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Flow by Role

### 3.1 Resident

| Step | Screen / Action | What happens |
|------|------------------|--------------|
| 1 | **Signup** `/signup` | Enter society code → select building + flat → role **Resident** → creates user in that society. |
| 2 | **Login** `/login` | Email + password → JWT; redirect to dashboard. |
| 3 | **Dashboard** `/dashboard` | **ResidentDashboard**: stats (today, pending, inside), quick links (Invite, Frequent), **Pending** invites to approve/reject, **Frequent visitors** to re-invite. |
| 4 | **Visitors** `/visitors` | See **only own visits** (scope = me). Filter: All / Pending / Approved / Checked in. **Approve** pending invites. No "Invite" if resident-only (invite is allowed for resident — see lib/auth: resident can invite). |
| 5 | **Invite visitor** `/visitors/invite` | Create invite: name, phone, purpose, optional building, expected arrival → OTP + QR (share with visitor). |
| 6 | **Frequent visitors** `/visitors/frequent` | List from visit history; **Quick Invite** pre-fills invite form. |
| 7 | Notifications | In-app notifications for e.g. visitor arrived; dismiss from Visitors or dashboard. |

**Resident cannot access:** Check-in, Walk-in, Guard, Blacklist, Society Management (admin/users), Platform.

---

### 3.2 Guard

| Step | Screen / Action | What happens |
|------|------------------|--------------|
| 1 | **Signup** `/signup` | Society code → role **Guard** (no building/flat required). |
| 2 | **Login** `/login` | JWT → dashboard. |
| 3 | **Dashboard** `/dashboard` | **GuardDashboard**: stats, **Muster** (export CSV), **Scan** (check-in), **Walk-in**; **Expected** (approved) and **Inside** (checked in) lists; Check-out; links to Visitors, Check-in. |
| 4 | **Check-in** `/checkin` | OTP (or QR) + consent → **Check-in**; visitor moves to "Currently inside". |
| 5 | **Walk-in** `/checkin/walkin` | Unknown visitor: select **resident (host)**, name, phone, purpose → **Register Walk-in**; resident gets notification to approve; after approval visitor can enter (no OTP). |
| 6 | **Guard** `/guard` | Full guard view: **Waiting for resident approval** (walk-ins), **Approved by resident**, **Currently inside** (Check-out), **Blacklist** (add by phone or from visit; remove). Export Muster CSV. |
| 7 | **Blacklist** `/blacklist` | View blacklisted visitors; **Add by phone** (name, phone, reason); **Remove**. |
| 8 | **Visitors** `/visitors` | See **all society visits** (scope = all). View only; no invite/approve from this list (approve is resident/committee). |

**Guard cannot access:** Society Management (admin/users), Platform. Can use Check-in, Walk-in, Guard, Blacklist, and view all visitors.

---

### 3.3 Committee (Chairman, Secretary, Treasurer)

Committee has **society-level admin**: everything Guard and Resident can do, plus user management and (depending on policy) building management.

| Step | Screen / Action | What happens |
|------|------------------|--------------|
| 1 | **Register society** or **invited by Chairman** | First user: `/register-society` → Chairman. Others: committee assigns Chairman/Secretary/Treasurer via **Management**. |
| 2 | **Dashboard** `/dashboard` | **AdminDashboard**: stats, quick links (Visitors, Guard, Check-in, Walk-in, **Management**), Activity, Reports. |
| 3 | **Visitors** `/visitors` | **All society visits**. **Invite** (like resident), **Approve** pending. |
| 4 | **Invite / Frequent** | Same as Resident. |
| 5 | **Check-in / Walk-in / Guard / Blacklist** | Same as Guard (committee can perform guard actions). |
| 6 | **Society Management** `/admin/users` | **Chairman/Secretary/Treasurer only.** List society users (incl. Chairman); **Add user** (email, name, role, password, flat); **Edit** user (assign **committee roles**: Chairman, Secretary, Treasurer; Resident/Guard only via signup). Activate/Deactivate, Delete. Stats: Total, Committee, Residents, Guards. |
| 7 | **Blacklist** `/blacklist` | Same as Guard; manage blacklist for society. |

**Committee cannot access:** Platform (all societies) — only **Platform Admin** can.

---

### 3.4 Platform Admin

| Step | Screen / Action | What happens |
|------|------------------|--------------|
| 1 | **Assigned in backend** | Not available via signup or register-society; platform-level. |
| 2 | **Dashboard** `/dashboard` | Single CTA: **Manage societies** → `/platform/societies`. |
| 3 | **Platform — Societies** `/platform/societies` | List all societies; **Add Society** (name, slug, contact email); create; view status. No per-society dashboard in app (API supports multi-society). |

---

## 4. Permission Matrix (Quick Reference)

| Capability | Resident | Guard | Committee | Platform Admin |
|------------|----------|-------|-----------|----------------|
| Dashboard (role view) | ✅ Resident | ✅ Guard | ✅ Admin | ✅ Platform |
| Invite visitor | ✅ | ❌ | ✅ | ❌* |
| Approve own invites | ✅ | ❌ | ✅ | ❌* |
| View visitors (scope) | Own only | All society | All society | — |
| Check-in (OTP/QR) | ❌ | ✅ | ✅ | ❌ |
| Walk-in | ❌ | ✅ | ✅ | ❌ |
| Guard page | ❌ | ✅ | ✅ | ❌ |
| Check-out | ❌ | ✅ | ✅ | ❌ |
| Blacklist | ❌ | ✅ | ✅ | ❌ |
| Society Management (users) | ❌ | ❌ | ✅ | ❌ |
| Platform (societies) | ❌ | ❌ | ❌ | ✅ |

*Platform Admin is not scoped to one society in the UI; invite/approve are society-scoped, so typically not used as Platform Admin.

---

## 5. Navigation (Header) by Role

- **All authenticated:** Dashboard, Visitors.
- **Resident + Committee:** Invite is available from Visitors; Frequent visitors.
- **Guard + Committee:** Check-in, Walk-in, Guard.
- **Committee only:** Management (admin/users).
- **Platform Admin only:** Platform (platform/societies).

---

## 6. Data Flow (Role in Request)

1. **Login / Signup / Register-society** → Backend returns JWT with `society_id`, `roles` (and optionally `realm_access.roles`).
2. **Primary role** (frontend): `getPrimaryRole(user)` = first in order: platform_admin → chairman → secretary → treasurer → guard → resident.
3. **Every API request** sends JWT; backend resolves `current_user` (and society_id).
4. **Visitors list:** Backend uses role: **resident** → filter by `host_id = current_user_id`; **guard / committee** → filter by `society_id`.
5. **Check-in / Walk-in / Blacklist / Users:** Backend uses `get_current_guard_or_admin`, `get_current_resident_or_admin`, or role checks (e.g. committee for PATCH user roles).

This is the **complete application flow** as designed, driven by the roles defined in the backend and enforced in both backend (RBAC) and frontend (route guards + UI visibility).
