# VMS Backend (FastAPI)

FastAPI backend for the Visitor Management System.

## Setup

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
# Edit .env with your settings
```

4. **Database:** On first run, tables are created automatically. If you have an existing `vms.db` from before society support was added, delete it (or back it up) and restart so new columns (`society_id`, `buildings`, etc.) are created. In demo mode, a default society and users are created on startup.

5. Start the server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs will be available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app entry point
│   ├── api/                 # API routers
│   │   ├── auth.py
│   │   ├── visitors.py
│   │   ├── checkin.py
│   │   └── health.py
│   ├── core/                # Core configuration
│   │   ├── config.py        # Settings
│   │   ├── database.py      # DB session management
│   │   ├── dependencies.py  # FastAPI dependencies
│   │   └── security.py      # JWT validation
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic schemas
│   ├── services/            # Business logic
│   └── utils/               # Utilities
├── requirements.txt
└── .env.example
```

## Development

- Use `structlog` for logging
- Follow async/await patterns
- Use Pydantic v2 for validation
- SQLAlchemy 2.0+ async patterns

## Demo / Super Admin (Platform)

For local testing, you can log in as a **platform admin (super admin)** user to view and manage all societies:

- **Email**: `superadmin@example.com`
- **Password**: `SuperAdmin@123` or `Admin@123`

This user has the `platform_admin` role and is not tied to any specific society. Use it from the web frontend login page to access the Platform → Societies UI and global views.

## Seeding subscription data

To populate subscription plans (Basic, Standard, Premium, Enterprise) and optionally assign Basic to existing societies:

```bash
# From the backend directory
python -m scripts.seed_subscriptions           # Plans only
python -m scripts.seed_subscriptions --societies  # Plans + assign Basic to societies without a subscription
```

After seeding, the Platform → Subscriptions page will show plans and subscriptions.

## Database design: users and societies

All users are stored in a **single `users` table** with a `society_id` column. This is the right design:

- **One table** keeps the schema simple, avoids N tables per society, and lets you query across societies (e.g. platform admin).
- **Filtering by society is fast** because:
  - There is an index on `users.society_id` (single-column).
  - There is a composite index on `(society_id, created_at)` for “list users by society” ordered by date.

With these indexes, “users for this society” is an index lookup, not a full table scan, even with many users and many societies. You do **not** need a separate table per society.

If you already have the `users` table and want to add the composite index by hand (e.g. you don’t recreate tables on startup), run once:

```sql
CREATE INDEX IF NOT EXISTS ix_users_society_id_created_at ON users (society_id, created_at);
```
