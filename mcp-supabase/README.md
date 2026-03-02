# VMS Supabase MCP Server

Lets the AI **inspect your VMS Supabase database** (e.g. project **vmsdevelop**) via MCP: list tables, get column schema, run read-only SQL. The AI can then check that the schema matches the backend and suggest fixes.

---

## What you need to give (do this once, securely)

You only need to give **one value**: the **Postgres connection string** for your Supabase project.  
**Do not paste it in chat.** Put it only in Cursor’s MCP config as an environment variable.

### 1. Get the connection string from Supabase

1. Open [Supabase Dashboard](https://supabase.com/dashboard) and select your project (**vmsdevelop**).
2. Go to **Project Settings** (gear) → **Database**.
3. Under **Connection string**, choose **URI**.
4. Copy the string. It looks like:
   - **Direct:**  
     `postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres`
   - Or **Direct (port 5432):**  
     `postgresql://postgres:[YOUR-PASSWORD]@db.[project-ref].supabase.co:5432/postgres`
5. Replace `[YOUR-PASSWORD]` with your **database password** (the one you set for the `postgres` user; if you forgot it, you can reset it on the same page).

You now have a single URL: `postgresql://...`. That is your **DATABASE_URL**.

### 2. Add it to Cursor’s MCP config (env only)

1. Open your project’s MCP config:
   - **Project:** `.cursor/mcp.json` in the repo root, or  
   - **User (global):** `~/.cursor/mcp.json` (Windows: `%USERPROFILE%\.cursor\mcp.json`).

2. Add the **vms-supabase** server and pass the URL **only via `env`** (so it never appears in chat or in code):

**Project-level (`.cursor/mcp.json` in repo root):**

```json
{
  "mcpServers": {
    "vms-visualize": {
      "command": "node",
      "args": ["C:/Users/LENOVO/Desktop/Visitor management systme/mcp-visualize/dist/index.js"]
    },
    "vms-supabase": {
      "command": "node",
      "args": ["C:/Users/LENOVO/Desktop/Visitor management systme/mcp-supabase/dist/index.js"],
      "env": {
        "DATABASE_URL": "postgresql://postgres.[REF]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres"
      }
    }
  }
}
```

Replace the value of `DATABASE_URL` with your real connection string. Use your actual path to `mcp-supabase/dist/index.js` if different.

**Security:**

- **Do not** paste `DATABASE_URL` or your password in chat.
- **Do not** commit `.cursor/mcp.json` with real secrets if the repo is shared (you can add `DATABASE_URL` to `.gitignore` for a local override file, or use user-level `mcp.json` only on your machine).

### 3. Build and restart Cursor

```bash
cd mcp-supabase
npm install
npm run build
```

Then **restart Cursor** so it loads the new MCP server and env.

---

## What the AI can do with this

Once the server is running and `DATABASE_URL` is set in `env`:

- **list_tables** – List tables in the `public` schema so the AI can see what exists.
- **get_table_columns** – Get column names and types for a table (e.g. `societies`, `buildings`, `users`).
- **run_sql** – Run **read-only** `SELECT` queries to check data (e.g. row counts, sample rows). No INSERT/UPDATE/DELETE.

So the AI can “run your database and check” by listing tables, inspecting schema, and running SELECTs, using only what you put in `env`.

---

## Tools summary

| Tool                 | Purpose                                  |
|----------------------|------------------------------------------|
| `list_tables`        | List all tables in `public` schema       |
| `get_table_columns`  | Describe columns for one table           |
| `run_sql`            | Run a **SELECT** query (read-only)       |

---

## If the server fails to start

- Check that `DATABASE_URL` is set in the `env` block for `vms-supabase` in `mcp.json`.
- Check that the connection string is correct (password, host, port, database name).
- Use **Session mode** pooler (port **6543**) if you have connection limits; otherwise Direct (port **5432**) is fine.
