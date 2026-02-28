# Frontend structure and practices

## Layout

- **`app/`** – Next.js App Router pages. Keep page components thin: auth gate + layout + composition of hooks and UI.
- **`components/`** – Reusable UI and feature components.
  - **`layout/`** – PageContainer, Header, Footer.
  - **`ui/`** – Design system primitives (Button, Input, Card, etc.).
  - **`guard/`** – Guard-dashboard-specific (GuardSection, GuardVisitsTable, BlacklistSection).
  - **`dashboard/`** – Role dashboards (Admin, Guard, Resident).
- **`hooks/`** – Custom hooks for data and auth (useAuth, useGuardData, useResidents).
- **`lib/`** – API client, auth helpers, types, constants.

## Patterns

1. **Auth and role gating**  
   Use `useAuth({ requireAuth: true, requireRole: fn, redirectTo })` so redirects and user state live in one place.

2. **Data loading**  
   Prefer hooks that return `{ data, loading, error, refetch }` (e.g. `useGuardData`, `useResidents`) instead of ad-hoc `useEffect` + `useState` in the page.

3. **Types**  
   Use shared types from `lib/types.ts` (Visit, Resident, BlacklistEntry, etc.). Avoid duplicating interfaces in pages.

4. **API**  
   Use `apiClient` from `lib/api.ts` and endpoints from `lib/api/endpoints.ts`. For file download, use `downloadBlob(path, filename)`.

5. **Constants**  
   Put magic numbers and config in `lib/constants.ts` (e.g. `GUARD_POLL_INTERVAL_MS`, `API_BASE_URL`).

6. **Pages**  
   Compose hooks and components; avoid large inline JSX. Use `PageContainer` for consistent max-width and padding.

7. **Forms**  
   Use `Input`, `Select`, `Button` from `@/components/ui`. Show validation errors and disable submit while `submitting`.

8. **Tables**  
   Use `GuardVisitsTable` (or similar) with columns and actions instead of raw `<table>` in multiple places.
