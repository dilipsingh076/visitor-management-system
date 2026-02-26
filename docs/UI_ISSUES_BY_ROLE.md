# UI Issues by Role

Summary of role-based UI gaps and inconsistencies in the frontend.

---

## Admin

| Issue | Severity | Description |
|-------|----------|-------------|
| **Blacklist link 404** | High | Dashboard "Blacklist" quick link goes to `/blacklist` but that route did not exist → fixed by adding `/blacklist` page. |
| **No "Users" in header** | Low | Admin reaches User management only via Dashboard "Users" quick link. Acceptable; no change. |
| **Muster export (GuardDashboard)** | High | "Export muster" in GuardDashboard used `fetch("/dashboard/muster")` (relative) so it hit Next.js instead of the backend → fixed to use API base URL. |

---

## Guard

| Issue | Severity | Description |
|-------|----------|-------------|
| **Blacklist link 404** | High | Guard dashboard "Blacklist" link pointed to `/blacklist` (missing page). Guard page has inline blacklist UI; link now goes to dedicated page. |
| **Muster export (GuardDashboard)** | High | Same as admin: relative URL → fixed. |
| **Muster export (Guard page)** | Medium | Guard page used `NEXT_PUBLIC_API_URL` then appended `/api/v1/...`, causing double `/api/v1` when env is set; default port was 8001 instead of 8000 → fixed. |
| **Quick check-in** | Low | GuardDashboard "Quick check-in" redirects to `/checkin?focus=otp` (no check-in-by-visit-id API). Documented; no backend change. |

---

## Resident

| Issue | Severity | Description |
|-------|----------|-------------|
| **Reject button** | Medium | "Reject" on pending approvals calls `PATCH /visitors/:id/reject`, which is not implemented in the backend. Button will 404 until backend adds reject. Consider disabling or showing "Coming soon." |
| **Invite / Visitors** | OK | Invite and Visitors list are role-gated correctly (resident + admin). |

---

## All roles

| Issue | Severity | Description |
|-------|----------|-------------|
| **Unknown role** | Medium | If backend returns a role other than admin/guard/resident (e.g. `member`), dashboard rendered empty. Fixed by showing a fallback message and suggesting contact with admin. |
| **Header when user is null** | Low | When authenticated but `/auth/me` has not loaded, header shows only Dashboard + Visitors. Acceptable defensive behavior. |
| **ROLE_LABELS** | Low | Unknown roles show raw value (e.g. "member"). Minor. |

---

## Access control (verified)

- **/dashboard** – All authenticated; content by role (admin/guard/resident/platform).
- **/visitors** – All authenticated; list scoped by role (resident = host_id=me; guard/admin = society).
- **/visitors/invite** – Redirect if not resident/admin.
- **/visitors/frequent** – Redirect if not resident/admin.
- **/checkin**, **/checkin/walkin** – Redirect if not guard/admin.
- **/guard** – Redirect if not guard/admin.
- **/admin/users** – Redirect if not admin.
- **/platform/societies** – Redirect if not super_admin.
- **/blacklist** – New page; guard and admin only.
