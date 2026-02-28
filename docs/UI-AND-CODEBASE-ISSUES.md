# Login / Auth UI & Codebase Issues

Generated from a full review of the login page, layout, and related code. Use this with the **vms-visualize** MCP server (run `fetch_login_page` with dev server running) to compare live HTML with these notes.

---

## 1. UI issues

### 1.1 Inconsistent class on "Add building"
- **Where:** Register Society → Step 4 → "+ Add building" button.
- **Issue:** Uses `text-primary` while the rest of the auth page uses explicit `text-emerald-600` / `text-slate-*`.
- **Fix:** Use `text-emerald-600 hover:text-emerald-700` for consistency.

### 1.2 Tab buttons lack visible focus
- **Where:** Sign In / Sign Up / Register Society tab buttons.
- **Issue:** No `focus:ring-*` or `focus-visible:ring-*`, so keyboard users don’t see a clear focus indicator.
- **Fix:** Add `focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2` (or similar) to tab buttons.

### 1.3 Login wrapper background vs page background
- **Where:** `ConditionalShell` uses `bg-background` for the login wrapper; login page uses `bg-slate-100`.
- **Issue:** `--background` is `#f8fafc` (slate-50), page is `#f1f5f9` (slate-100). Slight mismatch on the outer shell.
- **Fix:** For the login branch, use `bg-slate-100` (or a dedicated `auth-shell` class) so the wrapper matches the page.

### 1.4 Dark mode inconsistency
- **Where:** Society-not-found message uses `dark:text-amber-400`; rest of auth UI has no dark variants.
- **Fix:** Either add dark-mode styles for the whole auth flow or remove `dark:text-amber-400` for consistency.

### 1.5 Step content double padding
- **Where:** Register Society steps 1–5: form has `p-6 sm:px-8`, step content divs use `p-6 space-y-4`.
- **Issue:** Extra horizontal padding inside the form; layout still works but is a bit redundant.
- **Fix (optional):** Use `space-y-4` only and rely on form padding, or use `px-0 pt-2` for step content to avoid double horizontal padding.

### 1.6 Building code input very narrow
- **Where:** Step 4 building row: code input has `w-20`.
- **Issue:** Very small touch/click target; may be hard for some users.
- **Fix (optional):** Use `w-24` or `min-w-[5rem]` and ensure font size remains readable.

---

## 2. Codebase / structure issues

### 2.1 Monolithic login page
- **Where:** `app/login/page.tsx` (~747 lines).
- **Issue:** One large component with all state and markup for Sign In, Sign Up, and Register Society; harder to maintain and test.
- **Fix:** Split into smaller pieces, e.g.:
  - `AuthTabs` (tab bar)
  - `LoginForm`, `SignupForm`, `RegisterSocietyWizard` (or steps as subcomponents)
  - Shared `inputClass` / `labelClass` in a small `authStyles` module or constants file.

### 2.2 No shared auth form components
- **Where:** Inputs and labels are repeated with the same classes.
- **Issue:** Any design change requires updates in many places; risk of drift.
- **Fix:** Introduce `AuthInput`, `AuthLabel`, `AuthSelect` (or a single `AuthField`) that use the shared styles.

### 2.3 MCP server not in Cursor by default
- **Where:** `.cursor/mcp.json` uses a relative path `./mcp-visualize/dist/index.js`.
- **Issue:** If Cursor’s cwd isn’t the repo root (e.g. workspace has a space in the path), the server may not start.
- **Fix:** Use an absolute path in `mcp.json` or document that the workspace root must be the repo root. See README in `mcp-visualize/`.

---

## 3. What’s already in good shape

- Single scroll region on login (ConditionalShell + right-column `overflow-y-auto`).
- Consistent `inputClass` / `labelClass` for most inputs.
- Step progress (Register Society) with clear labels and progress bar.
- Error message styling (red box, rounded-xl).
- Submit button and “Back to home” link styling.
- Body `overflow-x-hidden` to avoid horizontal scroll.

---

## 4. How to re-run the MCP server and re-check

1. Start the frontend: `cd frontend-web && npm run dev`.
2. Ensure the MCP server is built: `cd mcp-visualize && npm run build`.
3. In Cursor, add **vms-visualize** to MCP config (`.cursor/mcp.json`) if not already there; use an absolute path if the server doesn’t start.
4. Restart Cursor, then in chat ask: “Use the fetch_login_page tool and list any UI issues you see in the HTML.”
5. Cross-check with this document and fix the items above as needed.
