# Database & API: Society-Scoped Residents

All resident and visit operations are **strictly scoped by society**. A guard or admin can only work with residents (hosts) and visits that belong to their assigned society.

---

## Design rules

1. **Users (residents, guards, admins)**  
   - `users.society_id` = the society the user belongs to.  
   - Guards and admins must have `society_id` set to register walk-ins and list data.  
   - Residents and admins are the only roles that can be hosts; they must belong to a society.

2. **Buildings (towers)**  
   - `buildings.society_id` is required (FK to societies).  
   - A building belongs to exactly one society.  
   - When resolving resident by “tower + flat”, the building must belong to the guard’s society.

3. **Visits**  
   - `visits.host_id` → `users.id`. The host is always a resident/admin.  
   - Effective scope: visits are scoped by the **host’s** `society_id`.  
   - List visits (guard/admin): only visits where `host.society_id` = current user’s `society_id`.

4. **Strict checks in API**  
   - **Walk-in (POST /visitors/walkin)**  
     - If `host_id` is sent: backend verifies that user exists and `user.society_id` = guard’s `society_id` (`ensure_user_in_society`).  
     - If `building_id` + `flat_number` are sent: backend verifies that building exists and `building.society_id` = guard’s `society_id` (`ensure_building_in_society`), then resolves resident only within that society.  
   - **List residents (GET /residents)**  
     - Only users with `society_id` = current user’s `society_id` and role in (resident, admin).  
   - **List visits (GET /visitors)**  
     - Guard/admin: only visits whose host has `society_id` = current user’s `society_id`.  
     - Resident: only their own visits (`host_id` = current user).

---

## Database (relevant parts)

- **societies** – One row per housing society.
- **buildings** – `society_id` NOT NULL; each building belongs to one society.
- **users** – `society_id` nullable (e.g. super_admin can be null); for resident/guard/admin it should be set so that all operations are society-scoped.
- **visits** – `host_id` → users.id; scope is enforced via host’s society in application logic (no FK to society on visits).

No cross-society access: a guard in Society A cannot register a walk-in for a resident in Society B, and cannot see or use Society B’s buildings or residents.
