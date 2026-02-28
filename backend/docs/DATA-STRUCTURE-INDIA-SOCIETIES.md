# Data Structure for India Societies & Residential Flats

This document describes how the backend models support **Indian gated societies and residential flats**, what is already correct, and what to improve.

---

## Target context (India)

- **Society** = One housing society / apartment complex (e.g. "Green Valley Apartments", "Sunrise Co-op").
- **Tower / Block** = Building within the society (e.g. Tower A, Block B, Wing C).
- **Flat / Unit** = Apartment (e.g. 1201, B-302). One or more residents per flat.
- **Resident** = User who can invite visitors (lives in a flat).
- **Guard** = Security at the society gate; manages check-in/check-out and walk-ins.
- **Admin** = Society admin; can manage buildings, users, blacklist.

One VMS deployment can serve **multiple societies** (multi-tenant). Each society has its own buildings, users, and (should have) its own blacklist.

---

## Current data structure

### 1. Society (one table) — **Correct**

| Field | Purpose |
|-------|--------|
| id, name, slug | Identity. Slug used for signup (e.g. `green-valley`). |
| address, city, state, pincode, country | India address. |
| contact_email, contact_phone | Society contact. |
| registration_number, society_type, registration_year | Optional; for cooperative/AOA and verification. |
| plan, status, is_active | For future billing / lifecycle. |

**Verdict:** Good for India. One table is enough; no need to split.

---

### 2. Building (separate table) — **Correct**

- **Society → Buildings** (one-to-many).
- Fields: `society_id`, `name`, `code`, `sort_order`, `is_active`.
- Represents **towers/blocks** (Tower A, Block B).

**Verdict:** Matches India structure. Residents and guards are scoped to a society and optionally to a building.

---

### 3. User (residents, guards, admins) — **Correct**

- `society_id` — User belongs to one society.
- `building_id` — Optional; which tower/block (for residents).
- `flat_number` — Flat/unit number (e.g. "1201", "B-302").
- `role` — admin | guard | resident.

So we have **Society → Building (tower) + flat_number** on User. That is enough for “Tower A, Flat 1201” without a separate Flat table.

**Verdict:** Fits India. No need for a separate Flat/Unit table for MVP unless you need multiple residents per flat with a shared “flat” entity.

---

### 4. Register Society flow — **Correct**

- **POST /api/v1/auth/register-society** creates in one go:
  1. **Society** (name, slug, address, city, state, pincode, contact, registration_number, society_type, registration_year).
  2. **Buildings** (optional list of `{ name, code }`).
  3. **First user** as **admin** with `society_id`, optional `building_id` and `flat_number`.

So a new society can register with multiple towers in one request. No extra “section” required for register flow.

**Verdict:** Correct for India. Optional: allow first admin to set their building + flat at register time (currently building is first building if provided; flat not in RegisterSocietyRequest).

---

### 5. Signup (join existing society) — **Correct**

- **POST /api/v1/auth/signup** with `society_slug`, `role` (guard | resident), optional `building_id`, `flat_number`, `phone`.
- Resolves society by slug; validates building belongs to society; creates user with `society_id`, `building_id`, `flat_number`.

**Verdict:** Correct.

---

### 6. Visitor & Visit — **Correct**

- **Visitor**: Global (reusable across societies). Identified by phone/name. No `society_id`.
- **Visit**: `visitor_id`, `host_id` (user). Society is inferred via `host.society_id`.
- All visit listing/dashboard/stats filter by `host.society_id` (society-scoped).

**Verdict:** Correct. One visitor can have visits in different societies; each society sees only its own visits.

---

### 7. Blacklist — **Needs improvement**

- **Current:** `Blacklist(visitor_id, reason, blacklisted_by)`. `Visitor.is_blacklisted` is a single boolean.
- **Problem:** Blacklist is **global**. If Society A blacklists a person, they are blocked in Society B too. In India, each society should have its **own** blacklist.
- **Required:** Blacklist must be **per-society**. So:
  - Add **`society_id`** to `Blacklist`.
  - When adding to blacklist, set `society_id` from current user’s society.
  - When listing blacklist, filter by `society_id`.
  - When checking at invite/check-in, deny only if there is an active Blacklist row for **(visitor_id, host.society_id)**.
- **Visitor.is_blacklisted:** Can remain as “blacklisted in at least one society” for quick pre-check, but the **source of truth** for “blocked in this society” is `Blacklist` with `society_id`. Alternatively, remove `Visitor.is_blacklisted` and derive only from `Blacklist` table (simpler long-term).

**Verdict:** Add `society_id` to Blacklist and scope all blacklist logic by society.

---

## Summary: what to do

| Area | Status | Action |
|------|--------|--------|
| Society table | OK | None. One table is fine. |
| Building table | OK | None. |
| User (society_id, building_id, flat_number) | OK | None. |
| Register society flow | OK | Optional: accept flat_number for first admin in request. |
| Signup flow | OK | None. |
| Visit/Visitor | OK | None. Society inferred via host. |
| **Blacklist** | **Wrong** | **Add society_id; scope add/list/check by society.** |

---

## Optional future improvements (not required for MVP)

1. **Floor** — If you need “Tower A, Floor 12, Flat 1201”, add a Floor table or `floor` on User. Many societies only use Tower + Flat.
2. **Flat/Unit table** — If one flat has multiple residents (owner + tenant) and you want one “Flat” entity with many users, add Unit( building_id, floor, flat_number ) and User.unit_id. For MVP, `flat_number` on User is enough.
3. **First admin flat at register** — RegisterSocietyRequest could accept optional `building_id` and `flat_number` for the first admin (already have buildings; flat_number can be added to schema and auth_service).
4. **Super admin** — User with no `society_id` can create societies (already in place via create_society).

---

## Conclusion

- **Single Society table** is correct; no need to split.
- **Society → Buildings → Users (with flat_number)** matches India societies and flats.
- **Register society flow** is correct; it creates society + buildings + first admin.
- The only **structural change** recommended is: **make Blacklist per-society** by adding `society_id` to the Blacklist table and scoping all blacklist operations by society.
