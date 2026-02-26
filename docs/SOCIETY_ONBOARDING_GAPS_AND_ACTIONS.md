# Society Onboarding Flow – Gaps and What We Have To Do

This doc analyses the **Society Onboarding Flow** (e.g. from [ChatGPT – Society Onboarding Flow Enhancement](https://chatgpt.com/share/699c4762-784c-8012-8730-d0844ea24800)) against the current codebase and lists where we are wrong in development and what to do next.

---

## 1. Where We Are Wrong in Development

### 1.1 Backend has no society-based auth or data

- **Frontend expects** society-based flows:
  - **Sign Up (Join Society):** `POST /api/v1/auth/signup` with `society_slug`, `role` (guard/resident), `building_id`.
  - **Register Society:** `POST /api/v1/auth/register-society` with society name, address, city, state, pincode, country, buildings, and first admin user.
  - **Login:** `POST /api/v1/auth/login` returning user + society.
- **Backend reality:** `backend/app/api/auth.py` only has `/me` and `/logout`. There are **no** `/auth/signup`, `/auth/login`, or `/auth/register-society` endpoints. So Sign Up, Login, and Register Society will all **fail** (404 or wrong behaviour) when using the real API.

### 1.2 Backend has no Society or Building models/APIs

- **Frontend expects:**
  - `GET /api/v1/societies/by-slug/:slug` (e.g. for “Society code” lookup on Sign Up).
  - `GET /api/v1/societies/`, `POST /api/v1/societies/` (list/create societies).
  - `GET /api/v1/buildings/?society_id=`, `POST /api/v1/buildings/` (list/create buildings).
- **Backend reality:** No `societies` or `buildings` routers in `main.py`. No Society/Building models in backend. So `getSocietyBySlug()`, `listSocieties()`, `createSociety()`, `listBuildings()`, `createBuilding()` in the frontend all call **non-existent endpoints**.

### 1.3 Backend has no Users API (society-scoped)

- **Frontend expects:** Admin User Management uses:
  - `GET /api/v1/users` – list users in current user’s society.
  - `POST /api/v1/users/` – create user (admin, guard, resident) in society with password.
- **Backend reality:** No `/users` router. No society-scoped user list/create. So Admin “User Management” will **fail** when not in demo/mock mode.

### 1.4 Auth model mismatch

- **Design intent:** Society-scoped users; admin only via Register Society; guard/resident via Sign Up with society code.
- **Backend intent:** Demo mode uses a single demo user; production assumes Keycloak JWT with roles. There is no notion of society_id/building_id in auth or DB, and no signup/login/register-society implementation.

### 1.5 Data model missing for societies

- **Backend has:** `users`, visitors, blacklist, notifications, etc. No `societies` or `buildings` tables, and no `society_id`/`building_id` on users. So even if we added endpoints, we have nowhere to store society/building data or link users to societies.

---

## 2. What We Have To Do (Action Points)

### 2.1 Backend – Data model

1. **Add `societies` table**  
   Fields: id, name, slug (unique), address, city, state, pincode, country, contact_email, contact_phone, plan, status, is_active, created_at, updated_at.

2. **Add `buildings` table**  
   Fields: id, society_id (FK), name, code, sort_order, is_active, created_at, updated_at.

3. **Add society/building to users**  
   Add `society_id` (FK, nullable for super_admin) and optionally `building_id` (FK) to `users` (or to the profile table that backs JWT/demo user). Ensure seed/demo user has a society if you want society-scoped behaviour in demo.

### 2.2 Backend – Auth endpoints

4. **Implement `POST /api/v1/auth/login`**  
   Accept email + password; validate user; attach society (and optionally building) to user; return user + society + access token (or set cookie). Must work in both demo mode and with your chosen production auth (e.g. Keycloak or custom).

5. **Implement `POST /api/v1/auth/signup`**  
   Accept: email, password, full_name, role (guard | resident), society_slug, optional building_id, phone, flat_number.  
   - Validate society exists (by slug); if buildings exist, validate building_id belongs to that society.  
   - Create user linked to society (and building); reject `role=admin` (return 400) so admin is only created via Register Society.

6. **Implement `POST /api/v1/auth/register-society`**  
   Accept: society_name, optional society_slug (derive from name if blank), address, city, state, pincode, country, contact_email, contact_phone, optional buildings[], plus first admin: email, password, full_name, phone.  
   - Create society, optionally create buildings, create first user with role admin and link to society; return user + society + token.

### 2.3 Backend – Society and Building APIs

7. **Add societies router**  
   - `GET /api/v1/societies/by-slug/:slug` – public or minimal-auth; optional `?include_buildings=true`; return society + buildings.  
   - `GET /api/v1/societies/` – list societies (e.g. super_admin only); optional search.  
   - `POST /api/v1/societies/` – create society (super_admin or open for register-society flow; align with step 6).

8. **Add buildings router**  
   - `GET /api/v1/buildings/?society_id=` – list buildings for a society (authenticated).  
   - `POST /api/v1/buildings/` – create building (admin of society or super_admin).

### 2.4 Backend – Users API (society-scoped)

9. **Add users router**  
   - `GET /api/v1/users` – list users in current user’s society; optional `?role=`. Require admin (or super_admin).  
   - `POST /api/v1/users/` – create user in current user’s society (email, full_name, role, password, phone, flat_number). Require admin. Return created user (no password).

### 2.5 Backend – Consistency and security

10. **Scope existing APIs by society where needed**  
    Ensure visitors, residents, dashboard, etc. are filtered by current user’s `society_id` so that societies are isolated.

11. **RBAC and register-society**  
    Ensure only guard/resident can use signup with society code; admin only via register-society; and that society_id is set from token/session in all relevant endpoints.

### 2.6 Frontend – Align with backend

12. **Error handling and fallbacks**  
    When backend returns 404/501 for signup, login, register-society, societies, buildings, users – show clear messages (“Feature not available” or “Backend not configured”) so it’s obvious when backend is missing.

13. **Optional: Demo/mock for development**  
    If you want to develop frontend without a full backend, keep a demo mode that mocks signup/login/register-society and society/by-slug so the flow is testable end-to-end.

### 2.7 Documentation and design

14. **Document the intended flow**  
    Add or update a doc (e.g. `SOCIETY_AND_ROLES_DESIGN.md`, `AUTH_FLOW_DIAGRAM.md`) that describes: Register Society (first admin), Sign Up (guard/resident with society code), Login, and that admin cannot be chosen when joining by code.

15. **API schema**  
    Update `API_SCHEMA.md` (or OpenAPI) with signup, login, register-society, societies, buildings, and users endpoints and request/response shapes.

---

## 3. Summary Table

| Area              | Current state                         | What to do                                      |
|-------------------|----------------------------------------|--------------------------------------------------|
| Auth – login      | Not implemented in backend             | Implement `POST /auth/login`                     |
| Auth – signup     | Not implemented in backend             | Implement `POST /auth/signup` (guard/resident)   |
| Auth – register   | Not implemented in backend             | Implement `POST /auth/register-society`          |
| Societies         | No model, no API                       | Add model + by-slug + list + create             |
| Buildings         | No model, no API                       | Add model + list + create                       |
| Users (society)   | No API                                 | Add GET/POST /users (society-scoped)            |
| User ↔ society    | Not in DB                              | Add society_id (and optional building_id)       |
| Frontend          | Built for full flow                    | Add error handling; optional demo/mock          |
| Docs              | No single source for flow              | Document society onboarding and auth flow       |

---

## 4. Priority Order (suggested)

1. **Backend:** Societies + Buildings models and migrations.  
2. **Backend:** Add society_id (and optional building_id) to users; seed with one society for demo.  
3. **Backend:** Implement login, signup, register-society.  
4. **Backend:** Societies and buildings routers (by-slug, list, create).  
5. **Backend:** Users router (list/create, society-scoped).  
6. **Backend:** Scope visitors/dashboard/etc. by society_id.  
7. **Frontend:** Clear errors when endpoints are missing; test with real backend.  
8. **Docs:** Society onboarding and auth flow + API schema.

Once these are done, the Society Onboarding Flow can work end-to-end with your backend instead of failing on missing APIs.

---

## 5. Do We Implement All Changes, or Is There a Better Idea?

You have three realistic options. The **best long-term** is **Option A (implement)**. The **best short-term** if you need a working demo soon is **Option B**.

### Option A: Implement the backend (recommended for a real product)

**What:** Implement the full list in section 2: societies + buildings models, auth (login/signup/register-society), societies/buildings/users APIs, and scope data by society.

**Pros:** Matches the frontend you already built; real multi-society product; clear path to production.  
**Cons:** Most work (roughly 1–2 weeks); you must choose and implement auth (JWT + passwords or Keycloak sync).

**Best for:** A **real, deployable product** with multiple societies.

---

### Option B: Minimal backend so the flow works (quick win)

**What:** Implement only the **minimum** so Login, Sign Up, and Register Society do not 404:

1. **Auth:** `POST /auth/login`, `POST /auth/signup`, `POST /auth/register-society` – create/validate users, link to **one default society** (create society if missing).
2. **Minimal data:** One `societies` table, add `society_id` to users; optional `buildings`. `GET /societies/by-slug/:slug` returns the default/single society.
3. **Users API:** `GET /users`, `POST /users` – list/create users in current user's society.

**Pros:** Less work; **single-society** flow works soon; frontend flows complete without 404s.  
**Cons:** Effectively single-society; multi-society would require adding proper scoping later.

**Best for:** A **working demo or MVP fast**; add full multi-society later.

---

### Option C: Do not implement; keep demo mode only

**What:** Keep demo auth only. Document that Register Society and Sign Up with society code are **UI-only** until backend is ready.

**Pros:** No backend work; focus on visitors, check-in, etc.  
**Cons:** Society onboarding is **not functional** for real use.

**Best for:** When **other features** are the priority and society onboarding can wait.

---

## 6. Recommendation: Best thing to do

| If your goal is… | Do this |
|------------------|--------|
| **Real product with multiple societies** | **Option A** – Full backend (section 2), in phases: models, then auth, then societies/buildings, then users, then scoping. |
| **Working demo / MVP quickly** | **Option B** – Minimal backend (login, signup, register-society, one society, users API); add multi-society later. |
| **Focus on visitors/check-in first** | **Option C** – Keep demo mode; document that society flows are coming later. |

**Practical recommendation:**  
- Need **something that works soon** (demo, pilot, single society)? Use **Option B** first, then grow into Option A.  
- Want **multi-society from day one** and can invest the time? Use **Option A** in the order of section 2.

There is no other idea that avoids implementing *some* backend: the frontend is built for society-based auth and APIs. The choice is **how much** to implement now (full vs minimal) and whether to **delay** society flows (Option C) or **enable them** (A or B).
