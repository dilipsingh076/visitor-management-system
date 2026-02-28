# Frontend folder structure

This app uses a **folder-based (feature-based)** structure and **Next.js App Router** conventions. Feature logic, hooks, and types live together; shared code lives in common folders.

## Next.js App Router

- **`app/`** is for routes only. Each segment uses `page.tsx`, and optionally `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`.
- **Thin pages**: `page.tsx` only imports and renders. Route-specific UI and logic live in a **private folder** under the route so they do not become URL segments.
- **Route-level colocation**: Use a private folder **`_components/`** under each route segment (e.g. `app/dashboard/_components/`, `app/guard/_components/`, `app/admin/users/_components/`). Put the actual page content there (e.g. `DashboardPageContent.tsx`, `GuardPageContent.tsx`). The underscore prefix ensures the folder is not a route. `page.tsx` stays a thin Server Component that imports and renders the client content component.
- **Server vs client**: Prefer Server Components for `page.tsx` (no `"use client"`). Put `"use client"` only in the colocated component under `_components/` when the page needs hooks, context, or browser APIs. Data fetching: use TanStack Query in feature hooks (called from the client component); no inline `useEffect` fetching in pages.
- **Loading & error**: Route segments that load data or have async UI have a `loading.tsx` (skeleton) and `error.tsx` (error boundary with reset).
- **Route groups**: Layouts exist at `app/(marketing)/layout.tsx`, `app/(auth)/layout.tsx`, `app/(dashboard)/layout.tsx`. Move route folders into these groups to get public / auth / authenticated layout isolation (URLs unchanged).
- **Middleware**: `middleware.ts` at project root protects `/dashboard`, `/guard`, `/visitors`, etc. Redirects to `/login` when auth cookie `vms_access` is missing. Set this cookie on login for protection to apply.

## Conventions

- **Feature folder** = one folder per feature (e.g. `auth`, `guard`, `residents`).  
  Inside that folder:
  - **types** in a `types.ts` file (or `types/index.ts`)
  - **hooks** in a `hooks/` folder (e.g. `hooks/useGuardData.ts`)
  - **components** specific to that feature in a `components/` folder
  - **context/providers** when needed (e.g. `context/AuthProvider.tsx`)
  - **`index.ts`** re-exports the public API of the feature

- **Common hooks** live in the root **`hooks/`** folder. Only shared, non–feature-specific hooks (e.g. `useDebounce`). Feature hooks are not duplicated here; import from the feature (e.g. `@/features/guard`).

- **Common types** live in **`types/index.ts`** (re-exporting from `lib/types` or defining shared API shapes). Feature-specific types stay in the feature’s `types.ts`.
- **Feature services** (optional): **`services/`** inside a feature wraps API calls and normalization; hooks call services instead of `lib/api` directly. See `features/visitors/services/`, `features/guard/services/`, etc.
- **Feature schemas** (optional): **`schemas/`** for validation (e.g. Zod) live in the feature, e.g. `features/auth/schemas/`, `features/checkin/schemas/`.

- **State / data**
  - **Auth**: React Context via `AuthProvider` and `useAuth` / `useAuthContext` from `features/auth`.
  - **Server state** (visits, blacklist, residents, etc.): **TanStack Query** in the feature’s hooks (e.g. `features/guard/hooks/useGuardData.ts`). Queries and mutations live there; pages use the returned hooks.

## Main folders

| Path | Purpose |
|------|--------|
| `app/` | Next.js App Router pages and layouts |
| `features/auth/` | Auth context, `useAuth`, `useAuthContext`, auth types |
| `features/guard/` | Guard dashboard: visits, blacklist hooks + components, guard types |
| `features/residents/` | Residents list hook and types |
| `features/platform/` | Platform (super admin): societies list/create hooks and types |
| `features/admin/` | Admin: society users list/create hooks, `UserData`, `ROLE_OPTIONS` |
| `hooks/` | Common hooks only (e.g. `useDebounce`). Re-exports like `useAuth` from `features/auth` for backward compatibility. |
| `types/` | Shared types (re-export from `lib/types`) |
| `components/` | Shared UI and layout. `components/guard/` re-exports from `features/guard` so imports like `@/components/guard` still work. |
| `lib/` | API client, auth helpers, constants |
| `providers/` | Root providers (e.g. `QueryProvider`, used in `app/layout.tsx`) |

## Import rules

- Use **feature entry points** when possible:  
  `import { useAuth } from "@/features/auth"`  
  `import { useGuardPending, GuardSection } from "@/features/guard"`  
  `import { useResidents } from "@/features/residents"`
- For shared types: `import type { Visit, BlacklistEntry } from "@/types"`
- For common hooks: `import { useDebounce } from "@/hooks"` or `import { useAuth } from "@/hooks/useAuth"` (same as `@/features/auth`)
