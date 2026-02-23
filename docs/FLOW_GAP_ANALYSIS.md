# Flowchart vs Implementation – Gap Analysis

## Remaining Gaps (What to Implement)

| # | Gap | Priority |
|---|-----|----------|
| 1 | **WhatsApp invite via WAHA** | High – core MVP |
| 2 | **Time validity** | Medium – expected arrival window at check-in |
| 3 | **Host notification** | Medium – "visitor arrived" when check-in |
| 4 | **Guard live dashboard** | Low – real-time updates (polling/WebSocket) |
| 5 | **Super Admin** | Low – buildings, flats, guards, config |
| 6 | **Resident registration** | Low – flats, family, badges (uses demo user) |
| 7 | **QR expiry** | Medium – QR has no expiry; OTP expires in 30 min |
| 8 | **Access control** | Phase 2 – boom barriers, gates |
| 9 | **Family members** | Phase 2 |

---

## Known Issues (Not Blocking)

- **QR expiry**: OTP expires in 30 min; QR does not
- **Auto-expiry**: Visit checkout is manual only; no auto-expiry by time
