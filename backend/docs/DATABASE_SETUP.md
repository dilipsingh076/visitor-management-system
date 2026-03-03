# Database connection (Supabase)

## How the app uses `DATABASE_URL`

1. **Config** (`app/core/config.py`)
   - Pydantic Settings loads variables from `backend/.env`.
   - `DATABASE_URL` is read from `.env`. If missing, it defaults to a local SQLite file.

2. **Engine** (`app/core/database.py`)
   - Reads `settings.DATABASE_URL`.
   - If the URL starts with `postgres://` or `postgresql://` (without `+asyncpg`), it is converted to `postgresql+asyncpg://...` so the async driver (asyncpg) is used.
   - Creates the SQLAlchemy async engine with that URL and SSL (for Supabase). No local fallback.

3. **Startup** (`app/main.py`)
   - On startup, `init_db()` runs and connects to the database to create/update tables. If connection fails (e.g. wrong host or password), the app logs the error and raises it.

---

## What to put in your `.env` file

Create or edit `backend/.env` and set **one** of the following.

### Option A: Direct connection (port 5432)

Get this from Supabase: **Project Settings → Database → Connection string → URI**.

```env
DATABASE_URL=postgresql+asyncpg://postgres:YOUR_DB_PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres
```

- Replace `YOUR_DB_PASSWORD` with the database password (from the same page, or the one you set when creating the project).
- Replace `PROJECT_REF` with your project reference (e.g. `ibuskfesyzvyruhudvvr`). It appears in the Supabase URL: `https://PROJECT_REF.supabase.co`.

### Option B: Session pooler (recommended if direct fails or times out)

From Supabase: **Project Settings → Database → Connection string → Session mode** (or Transaction mode). Use the URI they show; the app will switch it to the async driver.

Example shape (yours will have a different host/region):

```env
DATABASE_URL=postgres://postgres.PROJECT_REF:YOUR_DB_PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres
```

- Port is usually **6543** for the pooler (not 5432).
- You can paste Supabase’s URI as-is (`postgres://...`); the app converts it to `postgresql+asyncpg://` internally.

---

## Checklist – what is often missing

| Issue | What to do |
|-------|------------|
| **Wrong or placeholder host** | Use the **exact** host from Supabase (e.g. `db.xxxx.supabase.co` or `aws-0-xx.pooler.supabase.com`). No `XXXX` or placeholders. |
| **Wrong password** | Use the **Database password** from Project Settings → Database (reset if needed). |
| **Wrong port** | Direct: `5432`. Pooler: usually `6543`. |
| **Special characters in password** | If the password contains `@`, `#`, `/`, etc., URL-encode it (e.g. `@` → `%40`) in the URI. |
| **No `DATABASE_URL` in `.env`** | Add a line `DATABASE_URL=...` in `backend/.env`. Restart the backend after editing. |

---

## Quick test

1. Set `DATABASE_URL` in `backend/.env` as above.
2. From `backend/`: `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
3. If you see **"Database initialized"** in the logs, the URI is correct. If you see **"Database init skipped"** and an error, the message (e.g. getaddrinfo failed, password authentication failed) tells you what to fix.
