# VMS Architecture

## Folder Structure

Each app is **self-contained** for independent deployment. No shared folder—each project owns its types, theme, and UI.

```
project-root/
├── backend/                    # FastAPI - deploy to server
│   ├── app/
│   │   ├── api/               # Route handlers
│   │   ├── core/              # Config, DB, auth
│   │   ├── db/                # Seed, migrations
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   └── services/          # Business logic
│   └── requirements.txt
├── frontend-web/              # Next.js 15 - deploy to Vercel/Netlify
│   ├── app/                   # App Router
│   ├── components/
│   │   ├── layout/
│   │   └── ui/
│   ├── lib/
│   │   ├── api.ts
│   │   ├── api/endpoints.ts
│   │   └── types.ts
│   └── styles/
│       └── theme.css          # Design tokens
├── mobile/                    # React Native - deploy to app stores
│   └── VisitorManagementApp/
│       ├── src/
│       │   ├── components/ui/ # Button, Input, Card
│       │   ├── config/        # api, auth
│       │   ├── lib/api/       # endpoints
│       │   ├── screens/
│       │   ├── navigation/
│       │   ├── theme/         # colors, spacing
│       │   └── types/
│       └── web/               # Mobile web (Vite, localhost:8081)
│           └── theme.css      # Self-contained theme
└── docs/
```

## API Endpoints (with RBAC)

| Method | Endpoint | Allowed roles | Ownership / notes |
|--------|----------|---------------|-------------------|
| GET | /api/v1/dashboard/stats | Any authenticated | - |
| GET | /api/v1/dashboard/my-requests | resident, admin | Filtered by current user (host) |
| GET | /api/v1/dashboard/muster | guard, admin | - |
| POST | /api/v1/visitors/invite | resident, admin | Host = current user |
| POST | /api/v1/visitors/walkin | guard, admin | - |
| GET | /api/v1/visitors | any | Resident: only host_id=me; guard/admin: any |
| GET | /api/v1/visitors/:id | any | Resident: only own (host_id); guard/admin: any |
| PATCH | /api/v1/visitors/:id/approve | resident, admin | Only host of visit (or admin) |
| POST | /api/v1/checkin/otp | guard, admin | - |
| POST | /api/v1/checkin/qr | guard, admin | - |
| POST | /api/v1/checkin/checkout | guard, admin | - |
| GET | /api/v1/residents | guard, admin | Optional ?q= search |
| GET | /api/v1/blacklist | guard, admin | - |
| POST | /api/v1/blacklist | guard, admin | - |
| POST | /api/v1/blacklist/by-phone | guard, admin | - |
| DELETE | /api/v1/blacklist/:visitor_id | guard, admin | - |
| GET | /api/v1/notifications | resident, admin | Filtered by current user |
| PATCH | /api/v1/notifications/:id/read | resident, admin | Own notification only |

## Auth & RBAC

- **Demo mode** (`AUTH_DEMO_MODE=true`): No Keycloak; accepts any Bearer token. Use dependency overrides in tests to simulate roles.
- **Production**: Keycloak JWT validation; roles from `realm_access.roles` (resident, guard, admin).

### Enforced in backend

- **Dependencies** (`app.core.dependencies`): `get_current_user`, `get_current_resident_or_admin`, `get_current_guard_or_admin`, `get_current_any_role`.
- **Ownership**: Approve visit only if `visit.host_id == current_user_id` or user is admin. List/get visits: residents restricted to own host_id.
- **403 Forbidden**: Returned when role is missing or ownership check fails (consistent messages, no data leak).
- **Audit**: Admin actions (invite, walk-in, approve, check-in, check-out, muster) are logged to `audit_logs` (user_id, action, endpoint, details). See `app.models.audit` and `app.core.rbac.log_admin_action`.
- **Rate limiting**: Not implemented; consider adding (e.g. slowapi) for auth and sensitive endpoints.
