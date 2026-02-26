# Backend vs Frontend – What’s Correct and What’s Missing

Quick audit of society onboarding, auth, and related APIs.

---

## Correct (aligned)

| Area | Backend | Frontend | Status |
|------|---------|----------|--------|
| **Login** | `POST /auth/login` – email, password → user, society, access_token | `login(email, password)` – sends same, stores token & user, uses `data.society` | OK |
| **Sign up** | `POST /auth/signup` – email, password, full_name, role, society_slug, building_id?, phone?, flat_number? | Same fields in `signup()` and login page | OK |
| **Register society** | `POST /auth/register-society` – society_name, slug?, address?, city?, state?, pincode?, country?, contact_email, contact_phone?, **registration_number?**, **society_type?**, **registration_year?**, buildings?, email, password, full_name, phone? | Same in `registerSociety()` and Register Society form (including document section) | OK |
| **Get society by slug** | `GET /societies/by-slug/{slug}?include_buildings=true` – public | `getSocietyBySlug(slug, includeBuildings)` – same URL | OK |
| **List societies** | `GET /societies/?q=` – auth, scoped by user’s society or all for super_admin | `listSocieties(q)` – apiClient sends Bearer | OK |
| **List buildings** | `GET /buildings/?society_id=` – auth | `listBuildings(societyId)` – same | OK |
| **Create building** | `POST /buildings/` – society_id, name, code?, sort_order? | `createBuilding(body)` – same | OK |
| **List users** | `GET /users/?role=` – admin, society-scoped | `listUsers(role)` – same | OK |
| **Create user** | `POST /users/` – email, full_name, role, password, phone?, flat_number? | `createUser(body)` – same | OK |
| **Auth responses** | Login/signup/register-society return `user`, `society`, `access_token`, `token_type` | Frontend reads `result.user`, `result.society`, `data.access_token` and stores token | OK |
| **Error handling** | `HTTPException(detail=str(e))` → JSON `{ "detail": "..." }` | `err.detail \|\| "Signup failed"` – works for string detail | OK |

---

## Gap (not implemented in backend)

| Area | Frontend | Backend | Fix |
|------|----------|---------|-----|
| **Create society (platform)** | `createSociety()` in `lib/api.ts`; used on **Platform → Societies** page (super_admin) | No `POST /societies/` – only register-society exists | Add `POST /api/v1/societies/` for super_admin to create a society (name, slug, contact_email, etc.) without creating first admin. |

Until this is added, “Create society” on the platform societies page will get **404** or **405**.

---

## Optional improvements

1. **Validation error detail**  
   FastAPI can return `detail` as a list of dicts (e.g. Pydantic validation). Frontend uses `err.detail` as a string. If you ever show validation errors from the API, normalize: `Array.isArray(err.detail) ? err.detail.map(d => d.msg).join(", ") : err.detail`.

2. **Database**  
   If you had an existing DB before society/document fields were added, ensure `societies` has `registration_number`, `society_type`, `registration_year`, `documents_note`. New installs get them from `create_all`.

---

## Summary

- **Auth (login, signup, register-society)** – correct; request/response and document fields match.
- **Societies (by-slug, list)** – correct.
- **Buildings (list, create)** – correct.
- **Users (list, create)** – correct.
- **Platform “Create society”** – frontend exists, backend **POST /societies/** is implemented (platform admin only); add it if super_admin should create societies from the platform UI.
