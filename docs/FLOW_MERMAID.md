# VMS Flow Diagram – Implementation Status

One diagram: **✅ Done** | **❌ TODO** | **⚠️ Partial**

```mermaid
flowchart TD
    subgraph INVITE["Invitation"]
        A["✅ Host creates invitation"]
        B["✅ System generates QR + OTP"]
        C["❌ Send WhatsApp via WAHA"]
        D["Visitor receives message"]
    end
    A --> B
    B --> C
    C -.-> D
    B -.-> D

    subgraph CHECKIN["Check-in"]
        E["Visitor at gate"]
        F{Method?}
        G["✅ QR scan"]
        H["✅ OTP enter"]
        I["⚠️ Guard walk-in API"]
        J["✅ Consent checkbox"]
        K["✅ Validate: QR/OTP, blacklist, consent"]
        L{Valid?}
        M["✅ Check-in success"]
        N["✅ Access denied"]
    end
    D --> E
    E --> F
    F -->|QR| G
    F -->|OTP| H
    F -->|Manual| I
    G --> J
    H --> J
    I --> J
    J --> K
    K --> L
    L -->|Yes| M
    L -->|No| N

    subgraph POST["Post check-in"]
        O["✅ Visitor enters"]
        P["❌ Host notification"]
        Q["❌ Real-time tracking"]
        R["✅ Check-out on Guard page"]
        S["✅ Visit completed"]
    end
    M --> O
    M -.-> P
    O --> Q
    Q --> R
    R --> S

    subgraph GUARD["Guard Dashboard"]
        T["✅ Pending / Approved / Checked-in"]
        U["✅ Blacklist list + add/remove"]
        V["✅ Muster CSV export"]
        W["✅ Check-out"]
        X["❌ Live refresh"]
    end
    N --> T
    M --> T
    R --> T
```

---

## Status Legend

| Status | Meaning |
|--------|---------|
| ✅ Done | Implemented and working |
| ❌ TODO | Not implemented |
| ⚠️ Partial | API/backend exists; UI or integration incomplete |

---

## Implemented (This Round)

| # | Item | Notes |
|---|------|-------|
| 1 | **WhatsApp (WAHA)** | Set WAHA_API_URL; sends invite after create |
| 2 | **Host notification** | In-app notification when visitor checks in |
| 3 | **Guard live refresh** | Polling every 30s on Guard page |
| 4 | **Time validity** | ±60 min of expected_arrival; optional on invite |
| 5 | **QR expiry** | Same as OTP (30 min) |
| 6 | **Expected arrival** | Optional field on invite form |

## Remaining to Implement

| # | Item | Notes |
|---|------|-------|
| 1 | **Super Admin** | Buildings, flats, guards, config |
| 2 | **Resident registration** | Flats, family, badges (currently demo user) |
| 3 | **Real-time tracking** | Live status during visit (beyond guard poll) |
