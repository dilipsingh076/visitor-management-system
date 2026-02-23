# India-Optimized Visitor Management System (VMS)

A production-ready, self-hosted, full-stack Visitor Management System optimized for Indian use cases (gated societies, offices, factories).

## Features

See **[docs/FEATURES_BACKLOG.md](docs/FEATURES_BACKLOG.md)** for the full prioritized backlog (MVP → Phase 2 → Phase 3).

- Pre-approval via mobile/WhatsApp
- QR/OTP check-in
- Real-time presence tracking
- Guard dashboard
- Resident/host approval workflow
- DPDP Act 2023 compliance (consent logging, data minimization, erasure support)
- Optional blacklisting & emergency muster export

## Tech Stack

- **Backend**: Python + FastAPI (async, Pydantic v2)
- **Frontend Web**: Next.js 15+ (App Router, Server Components, TypeScript)
- **Mobile**: React Native (CLI, no Expo, Android-first) + Mobile Web (Vite at localhost:8081)
- **Database**: SQLite by default (no PostgreSQL required); PostgreSQL for production
- **Auth**: Keycloak (OpenID Connect / OAuth2, RBAC)
- **Real-time**: Socket.io or Redis Pub/Sub + WebSocket
- **Storage**: MinIO (S3-compatible)
- **Notifications**: WAHA (WhatsApp) + Email

## Project Structure

Each app is **self-contained** for independent deployment:

```
project-root/
├── backend/                # FastAPI - deploy to server
├── frontend-web/           # Next.js - deploy to Vercel/Netlify (has own theme, types)
├── mobile/                 # React Native - deploy to App Store / Play Store (has own theme, types)
└── docs/
```

## Setup Instructions

### Backend Setup (SQLite - no PostgreSQL required)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
python -m pip install -r requirements.txt   # Use python -m pip if pip not in PATH
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

**Windows (no pip in PATH):** Use `python -m pip` instead of `pip`. Or run `.\run.bat` (uses `python -m pip` internally).

**Quick start:** `.\run.bat` creates venv, installs deps, and starts the server.

### Frontend Web Setup

```bash
cd frontend-web
npm install
npm run dev
```

### Mobile App Setup

```bash
cd mobile/VisitorManagementApp
npm install
# For Android
npx react-native run-android
# Mobile web (browser at localhost:8081)
npm run web
```

## Development

- Backend API docs: http://localhost:8000/docs
- Frontend Web: http://localhost:3000
- Mobile Web: http://localhost:8081 (run `npm run web` in mobile/VisitorManagementApp)
- Mobile: Follow React Native CLI setup for your platform

## Git: pushing all folders (backend, frontend-web, mobile, docs)

If only **backend** and **docs** show up when you push (and not frontend-web or mobile), the cause is usually **nested `.git`** folders from Next.js/React Native. Fix: from repo root run `.\fix-git-and-push.ps1`, then commit and push. See **[docs/GIT_PUSH_ALL.md](docs/GIT_PUSH_ALL.md)** for details.

## License

MIT
