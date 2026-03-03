# Supabase database connection – diagnosis

## What we checked

- **Supabase MCP (user-supabase)** was used to access your project `ibuskfesyzvyruhudvvr`.
- **Result:** The database is reachable from Supabase’s side. `get_project_url` and `list_tables` both succeeded (tables: societies, users, visitors, visits, buildings, blacklist, notifications, audit_logs, consent_logs).
- So the problem is not the project or the database; it’s the connection **from your machine** (backend or vms-supabase MCP).

## Likely cause: SSL

- **Backend** was using the **pooler** URL (`aws-1-ap-southeast-1.pooler.supabase.com:5432`) with **no SSL** (`DB_USE_SSL` was unset/false).
- Many networks and Supabase pooler expect **TLS** for Postgres. Without SSL, the connection can be refused or hang.

## Changes made

1. **Backend (`backend/.env`)**  
   - Set **`DB_USE_SSL=true`** so the FastAPI app uses SSL when connecting to the pooler.  
   - Left **`DATABASE_URL`** as-is (pooler, Session mode, port 5432).

2. **vms-supabase MCP (`.cursor/mcp.json`)**  
   - **`DATABASE_URL`** was updated from the **direct** host (`db.ibuskfesyzvyruhudvvr.supabase.co`) to the same **pooler** URL as the backend (`aws-1-ap-southeast-1.pooler.supabase.com:5432`).  
   - So backend and MCP use the same connection path (pooler).

3. **vms-supabase MCP (`mcp-supabase/src/index.ts`)**  
   - For Supabase URLs (host contains `supabase.co` or `pooler.supabase.com`), the Node Postgres pool now uses **`ssl: { rejectUnauthorized: false }`** so the pooler connection works with Supabase’s certificate.

## What you should do

1. **Restart the backend**  
   Run: `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`  
   You should see “Database initialized” if the connection works.

2. **Restart Cursor** (or reload the window)  
   So the vms-supabase MCP picks up the new env and code. Then try listing tables via the vms-supabase MCP again.

3. **If it still fails**  
   - In the backend terminal, check the exact error (e.g. `connection refused`, `timeout`, `SSL`, `password authentication failed`).  
   - Try **Transaction pooler** on port **6543**: in `.env` set  
     `DATABASE_URL=postgresql://postgres.ibuskfesyzvyruhudvvr:PASSWORD@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres`  
     (replace PASSWORD with your DB password).  
   - Confirm the **database password** in Project Settings → Database in the Supabase dashboard and that it matches `.env`.

## Summary

| Component      | Before                         | After                                      |
|----------------|--------------------------------|--------------------------------------------|
| Backend        | Pooler URL, no SSL             | Pooler URL + `DB_USE_SSL=true`             |
| vms-supabase   | Direct URL (often unreachable) | Same pooler URL as backend + SSL in code   |
| user-supabase  | Already working (Supabase MCP) | No change                                  |

The database is up and reachable from Supabase; enabling SSL and using the pooler from your machine should resolve the connection issue.
