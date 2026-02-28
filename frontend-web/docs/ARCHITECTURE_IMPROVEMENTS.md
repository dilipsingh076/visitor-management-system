# Architecture Improvements (Architect-Level)

## 1. Feature services

API calls are now wrapped in **feature-level services** so business logic and normalization live next to the feature.

- **`features/<name>/services/`** – one or more service files that call `lib/api` (or `apiClient` + `API`) and normalize responses.
- **Hooks** call these services instead of `lib/api` directly.

**Benefits:** Logic stays in the feature, `lib/api.ts` stays a thin client, and services are easy to test and reuse.

**Current services:**

| Feature   | Service(s) | Used by hooks |
|----------|------------|----------------|
| visitors | `visitors.service.ts`, `notifications.service.ts` | useVisitorsList, useUnreadNotifications, useMarkNotificationRead, useApproveVisit, useRejectVisit, useInviteVisitor |
| guard    | `guard.service.ts` | useGuardPending, useGuardApproved, useGuardCheckedIn, useGuardBlacklist, useGuardCheckout, useGuardBlacklistByPhone, useGuardBlacklistByVisitorId, useGuardRemoveBlacklist, useGuardExportMuster |
| checkin  | `checkin.service.ts` | useCheckInOtp, useCheckInQr |
| dashboard| `dashboard.service.ts` | useDashboardStats, useDashboardMyRequests, useRecentVisits |
| platform | `platform.service.ts` | useSocieties, useCreateSociety |
| admin    | `admin.service.ts` | useAdminUsers, useCreateAdminUser |

## 2. Validation schemas (Zod)

**`features/<name>/schemas/`** – Zod schemas for validation, colocated with the feature.

- **`features/auth/schemas/`** – `loginSchema`, `signupSchema` (and inferred types `LoginInput`, `SignupInput`).
- **`features/checkin/schemas/`** – `checkInOtpSchema`, `checkInQrSchema` (and `CheckInOtpInput`, `CheckInQrInput`).

**Usage:** Use in forms with `schema.parse(data)` or `schema.safeParse(data)` for client- or server-side validation. Install Zod if needed: `npm install zod`.

## 3. Route groups (layout isolation)

Route groups are set up so you can have **public**, **auth**, and **authenticated** layouts without changing URLs.

- **`app/(marketing)/layout.tsx`** – for public/marketing pages (home, about, contact, faq, features, how-it-works, privacy, use-cases).
- **`app/(auth)/layout.tsx`** – for auth pages (login, signup).
- **`app/(dashboard)/layout.tsx`** – for authenticated app (dashboard, guard, visitors, checkin, blacklist, admin, platform).

**To use them:** Move the corresponding route folders into these groups. For example:

- Move `app/page.tsx` → `app/(marketing)/page.tsx`
- Move `app/about/`, `app/contact/`, … → `app/(marketing)/about/`, etc.
- Move `app/login/` → `app/(auth)/login/`
- Move `app/dashboard/`, `app/guard/`, … → `app/(dashboard)/dashboard/`, `app/(dashboard)/guard/`, etc.

URLs stay the same; only the layout hierarchy changes.

## 4. Middleware (route protection)

**`middleware.ts`** at the project root protects authenticated routes.

- **Protected paths:** `/dashboard`, `/guard`, `/visitors`, `/checkin`, `/blacklist`, `/admin`, `/platform` (and nested paths).
- **Behavior:** If the auth cookie (see below) is missing, the user is redirected to `/login?from=<path>`.
- **Config:** `config.matcher` lists the protected path patterns.

**Auth cookie:** The middleware checks for a cookie named **`vms_access`**. For this to work:

1. On login success, set a cookie with the same name (e.g. from the login page or API response).
2. If the app currently only stores the token in `localStorage`, add a step that also sets `document.cookie = "vms_access=..."` (or use an httpOnly cookie from the backend) so the middleware can enforce protection.

Role-based rules (guard vs admin vs platform) remain in pages/layouts; middleware only enforces “logged in” for these paths.
