# Register Society – API flow (debug from scratch)

## Endpoints

| Method | Path | Purpose |
|--------|------|--------|
| GET | `/api/v1/auth/register-society/check` | Debug: check if API is reachable. Returns `{"ok": true, "message": "..."}`. |
| POST | `/api/v1/auth/register-society` | Register a new society and first admin user. |

## Request (POST)

**URL:** `POST http://localhost:8000/api/v1/auth/register-society`  
**Headers:** `Content-Type: application/json`  
**Body (JSON):** See `RegisterSocietyRequest` in `app/schemas/auth.py`:

- `society_name` (required), `society_slug` (optional)
- `address`, `city`, `state`, `pincode`, `country` (optional)
- `contact_email` (required), `contact_phone` (optional)
- `registration_number`, `society_type`, `registration_year` (optional)
- `buildings` (required): list of `{ "name": string, "code"?: string }`, at least one with non-empty name
- `admin_building_index` (optional, default 0)
- `email`, `password` (min 6), `full_name` (required)
- `phone`, `flat_number` (optional)

## Response

**Success (200):**

```json
{
  "user": { "id", "email", "full_name", "roles", "society_id", "building_id", ... },
  "society": { "id", "slug", "name" },
  "access_token": "...",
  "token_type": "bearer"
}
```

**Error (4xx/5xx):** Always JSON with a `detail` field (string or array of validation errors):

```json
{ "detail": "Error message here" }
```

## Backend flow (from scratch)

1. **Route** `app/api/auth.py` → `POST /register-society` → `register_society(body, db)`
2. **Validate** buildings: at least one building with a non-empty name; else 400.
3. **Service** `app/services/auth_service.py` → `register_society(db, ...)`:
   - Slug from `society_slug` or slugify(society_name); check slug unique → else ValueError (400).
   - Check email unique → else ValueError (400).
   - Create `Society`, flush; create `Building`s, flush; create admin `User`, flush.
   - `create_access_token(...)` and return (user, society, token).
4. **Route** returns `JSONResponse(200, { user, society, access_token, token_type })`.
5. **On exception:** `ValueError` → 400 with `detail=str(e)`. `IntegrityError` (duplicate slug/email) → 400 with friendly message. `OperationalError` → 500 with DB message. Any other → 500 with `detail=str(e)`. All error responses include CORS headers so the frontend can read them.

## Frontend flow

1. **Page** `app/(auth)/register-society/page.tsx` → form submit → `registerSociety(payload)` from `lib/auth.ts`.
2. **auth.ts** → `fetch(POST, /api/v1/auth/register-society, body: JSON.stringify(data))`.
3. **On response:** If `!response.ok`, read body as text, parse JSON if possible, extract `detail` → set error state and show in `<Alert>`. On success, parse JSON, set user/token, redirect to `/dashboard`.
4. **Debug:** In browser DevTools → Network tab, inspect the `register-society` request (status, response body). Console shows `[registerSociety] API error:` or `[RegisterSociety] Backend error:` with the message.

## Quick debug checklist

- **Frontend not showing error:** Open DevTools → Console and Network. Check the failed request’s response body; it should be JSON with `detail`. If CORS was blocking, you’d see a CORS error in Console; the backend now adds CORS to all responses including 5xx.
- **500 with no body:** Backend logs the traceback; run backend in terminal and look for `register_society: exception` or `Unhandled exception`.
- **Test API reachable:** From browser or curl: `GET http://localhost:8000/api/v1/auth/register-society/check` → should return `{"ok": true, ...}`.
