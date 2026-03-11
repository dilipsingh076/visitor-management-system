# Visitor Management System — Architecture & How It Works

One place for **system architecture**, **component tree**, **data flow**, **route map**, and **database ER**. Below: a single high-level diagram, then the **database ER** in a second diagram.

---

## 1. System, Routes, Components & Data Flow (One Diagram)

```mermaid
flowchart TB
  subgraph BROWSER["🌐 Browser"]
    USER["User"]
  end

  subgraph FRONTEND["Next.js Frontend (React)"]
    direction TB
    subgraph LAYOUT["Layout"]
      HEADER["Header / Nav"]
      DASH_LAYOUT["(dashboard) layout"]
    end
    subgraph ROUTES["Frontend Routes"]
      R_HOME["/ (public)"]
      R_LOGIN["/login"]
      R_SIGNUP["/signup"]
      R_REG_SOC["/register-society"]
      R_DASH["/dashboard"]
      R_VISIT["/visitors"]
      R_INVITE["/visitors/invite"]
      R_FREQ["/visitors/frequent"]
      R_CHECKIN["/checkin"]
      R_WALKIN["/checkin/walkin"]
      R_GUARD["/guard"]
      R_BL["/blacklist"]
      R_ADMIN["/admin/users"]
      R_PLAT["/platform/societies"]
    end
    subgraph FEATURES["Features (hooks + components)"]
      AUTH_CTX["AuthProvider / useAuth"]
      DASHBOARD_F["AdminDashboard / GuardDashboard / ResidentDashboard"]
      VISITORS_F["useVisitorsList, useInviteVisitor, useApproveVisit"]
      GUARD_F["useGuardPending, useGuardCheckout, BlacklistSection"]
      USERS_F["useUserManagement"]
    end
    subgraph UI["Shared UI"]
      PAGECONTAINER["PageContainer, PageHeader"]
      CARDS["Card, Button, Input, Modal"]
    end
    DASH_LAYOUT --> ROUTES
    ROUTES --> FEATURES
    FEATURES --> UI
  end

  subgraph API_LAYER["API Layer"]
    APICLIENT["apiClient (JWT in cookie/header)"]
    ENDPOINTS["endpoints.ts: /api/v1/..."]
  end

  subgraph BACKEND["FastAPI Backend"]
    direction TB
    subgraph ROUTERS["API Routers"]
      AUTH_R["/api/v1/auth"]
      VISIT_R["/api/v1/visitors"]
      CHECKIN_R["/api/v1/checkin"]
      DASH_R["/api/v1/dashboard"]
      RES_R["/api/v1/residents"]
      BL_R["/api/v1/blacklist"]
      NOTIF_R["/api/v1/notifications"]
      SOC_R["/api/v1/societies"]
      BLD_R["/api/v1/buildings"]
      USERS_R["/api/v1/users"]
    end
    subgraph DEPS["Dependencies"]
      GET_CURRENT_USER["get_current_user (JWT)"]
      SOCIETY_SCOPE["society_id from token"]
    end
    subgraph SERVICES["Services"]
      AUTH_SVC["auth_service"]
      VISIT_SVC["visit_service"]
      BL_SVC["blacklist_service"]
    end
    ROUTERS --> DEPS
    ROUTERS --> SERVICES
  end

  subgraph DB["PostgreSQL (Supabase)"]
    TABLES["societies, buildings, users, visitors, visits, consent_logs, blacklist, notifications, audit_logs"]
  end

  USER --> FRONTEND
  AUTH_CTX --> APICLIENT
  FEATURES --> APICLIENT
  APICLIENT --> ENDPOINTS
  ENDPOINTS --> ROUTERS
  SERVICES --> DB
  DEPS --> DB
```

**How it works (short):**

- **Browser** → user opens **Next.js** app; **AuthProvider** holds user and token.
- **Frontend routes** (e.g. `/dashboard`, `/visitors`, `/guard`) render **feature** components that call **apiClient** with JWT.
- **apiClient** hits **FastAPI** at `/api/v1/...`; **routers** use **dependencies** (e.g. `get_current_user`, society from token) and **services** to talk to **PostgreSQL**.
- **Data flow:** Login/Signup → JWT stored → every API request sends JWT → backend resolves user & society → services read/write DB.

---

## 2. Database ER Diagram

```mermaid
erDiagram
  societies ||--o{ buildings : "has"
  societies ||--o{ users : "has"
  buildings ||--o{ users : "in"

  users ||--o{ visits : "host"
  visitors ||--o{ visits : "has"
  visits ||--o{ consent_logs : "has"

  societies ||--o{ blacklist : "has"
  visitors ||--o{ blacklist : "blacklisted"
  users ||--o{ blacklist : "blacklisted_by"
  users ||--o{ notifications : "receives"

  societies {
    uuid id PK
    string name
    string slug UK
    string contact_email
    string status
  }

  buildings {
    uuid id PK
    uuid society_id FK
    string name
    string code
  }

  users {
    uuid id PK
    string email UK
    string full_name
    string role
    json roles
    uuid society_id FK
    uuid building_id FK
    string flat_number
  }

  visitors {
    uuid id PK
    string phone
    string full_name
    boolean is_blacklisted
  }

  visits {
    uuid id PK
    uuid visitor_id FK
    uuid host_id FK
    string status
    string purpose
    string otp
    boolean consent_given
  }

  consent_logs {
    uuid id PK
    uuid visit_id FK
    string consent_type
    boolean consent_given
  }

  blacklist {
    uuid id PK
    uuid society_id FK
    uuid visitor_id FK
    uuid blacklisted_by FK
    text reason
  }

  notifications {
    uuid id PK
    uuid user_id FK
    string type
    string title
    boolean read
  }

  audit_logs {
    uuid id PK
    uuid user_id
    string action
    string endpoint
  }
```

**Relations in short:**

- **Society** has many **Building**s and many **User**s (residents, guards, committee).
- **User** has many **Visit**s as host; **Visitor** has many **Visit**s; each **Visit** can have **ConsentLog**s (DPDP).
- **Blacklist** links **Society**, **Visitor**, and **User** (who blacklisted).
- **Notification** belongs to **User**.
- **AuditLog** stores user_id, action, endpoint (no FK for flexibility).

---

## 3. Route ↔ API Mapping (Quick Reference)

| Frontend route        | Main API used |
|-----------------------|----------------|
| `/login`, `/signup`   | `POST /auth/login`, `POST /auth/signup` |
| `/register-society`   | `POST /auth/register-society` |
| `/dashboard`         | `GET /dashboard/stats`, `my-requests`, `muster` |
| `/visitors`           | `GET /visitors`, `PATCH /visitors/:id/approve` |
| `/visitors/invite`    | `POST /visitors/invite`, `GET /buildings` |
| `/visitors/frequent`  | `GET /visitors` (derived) |
| `/checkin`            | `POST /checkin/otp`, `POST /checkin/qr` |
| `/checkin/walkin`     | `POST /visitors/walkin`, `GET /residents` |
| `/guard`              | Dashboard + visitors + `POST /checkin/checkout`, blacklist APIs |
| `/blacklist`          | `GET/POST /blacklist`, `POST /blacklist/by-phone`, `DELETE /blacklist/:id` |
| `/admin/users`        | `GET/POST/PATCH /users` |
| `/platform/societies` | `GET/POST /societies` |

This file gives you **one diagram for how the system, components, data flow, and routes work**, plus **one ER diagram** and a **route–API map** in a single place.
