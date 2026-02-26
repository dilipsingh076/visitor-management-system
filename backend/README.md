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
