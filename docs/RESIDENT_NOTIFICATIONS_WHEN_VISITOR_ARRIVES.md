# Sending Notifications to the Resident When a Visitor Arrives

This doc explains **how the app can notify the resident’s device** when a visitor comes (check-in or walk-in). It matches your current backend and mobile setup and gives a clear path to implement push.

---

## Current behaviour

| Event | Backend | Resident sees it |
|-------|--------|-------------------|
| **Visitor checks in** (OTP/QR) | Creates a `Notification` (type `visitor_arrived`) for the **host** in `visit_service.checkin_visit()`. | Only when they open the **web app** or **mobile app** and the app fetches `GET /notifications`. No push to device. |
| **Walk-in registered** (guard selects resident) | Creates a **Visit** with status `PENDING`. **No** `Notification` is created. | Pending visit appears in **Dashboard → My requests** (API: `GET /dashboard/my-requests`). No in-app notification and no push. |

So today the resident is only notified **in-app** when they already have the app open or when they open it later; there is **no push to the device** yet.

---

## Goal: “Notify the resident’s device when visitor came”

Two events are useful to push to the resident:

1. **Walk-in at gate** – “Visitor X is at the gate. Approve or reject?”
2. **Visitor checked in** – “Visitor X has checked in.” (you already create a DB notification for this)

To send these to the **device** (phone or browser), you need **push notifications** in addition to the existing in-app notifications.

---

## High-level flow

```
Visitor arrives
    → Guard registers walk-in OR visitor checks in (OTP/QR)
    → Backend creates/updates Visit and (optionally) Notification
    → Backend looks up “which devices does this host (resident) have?”
    → Backend sends a push message to each device (FCM for mobile, Web Push for browser)
    → Resident’s phone/browser shows the notification even when app is closed
```

So the missing pieces are:

1. **Device registration** – Resident’s devices (mobile + optional web) register a **push token** with the backend and associate it with the resident (user_id).
2. **Backend push sender** – When you create a notification (or when a walk-in is created), the backend calls FCM / Web Push to send the same message to those tokens.

---

## Option 1: Mobile app (React Native) – FCM (recommended)

You already have FCM in the mobile app (`mobile/.../lib/notifications.ts`): token is obtained and stored locally; the commented line shows the intended backend call.

### 1. Backend: store device tokens

- Add a table, e.g. `user_push_tokens`:
  - `user_id` (FK to users)
  - `token` (FCM device token, unique)
  - `platform` (e.g. `ios` / `android`)
  - `created_at` / `updated_at`
- Add API:
  - **POST /api/v1/notifications/register-device**  
    Body: `{ "token": "<fcm_token>", "platform": "android" | "ios" }`  
    Auth: current user. Upsert token for that user (same token can be updated, e.g. on refresh).
  - Optionally **DELETE .../register-device** or **POST unregister** to remove token on logout.

### 2. Mobile app: send token to backend

- After getting the FCM token (and after login), call:
  - `POST /notifications/register-device` with `{ token, platform: Platform.OS }`.
- On token refresh (`onTokenRefresh`), call the same endpoint again to update.
- On logout, call unregister if you add it.

So “when visitor came” the backend already knows the resident’s FCM token(s).

### 3. Backend: send FCM when visitor arrives

When you want to notify the resident:

- **When visitor checks in** – You already create a `Notification` in `checkin_visit()`. Right after that (or in a small helper), get `user_id = visit.host_id`, fetch all push tokens for that `user_id`, and for each token call **FCM HTTP v1 API** (or Admin SDK) to send a message with:
  - title: e.g. “Visitor checked in”
  - body: e.g. “{visitor_name} has checked in.”
  - data: `{ type: "visitor_arrived", visitId: "<visit_id>" }` so the app can open the visit when the user taps the notification.

- **When walk-in is registered** – In `create_walkin_visit()` (or right after it in the API), create a `Notification` for the host with type e.g. `walkin_pending`, then do the same: look up host’s push tokens and send via FCM with e.g. “Visitor at gate” / “Approve or reject?” and `type: "walkin_pending", visitId: "..."`.

FCM needs a **server key** (or service account) in the backend env; the mobile app uses the existing `google-services.json` / Firebase config.

---

## Option 2: Web app (Next.js) – Web Push

For residents who use **only the browser** (no mobile app), you can use **Web Push** (VAPID).

### 1. Frontend: request permission and subscribe

- Use the **Web Push API** in the browser (e.g. `registration.pushManager.subscribe()` with VAPID public key).
- You get a **subscription** object (endpoint + keys). Send it to the backend (e.g. as JSON).
- Backend stores it in a table, e.g. `user_push_tokens` with `platform = 'web'` and payload = full subscription (or endpoint + auth keys).

### 2. Backend: send Web Push

- When notifying the resident (same two events: walk-in created, visitor checked in), load the resident’s **web** push subscriptions.
- Use a library (e.g. **pywebpush** in Python) to send a push message to each subscription (endpoint + VAPID private key). Payload can be the same as FCM: title, body, `data: { type, visitId }`.

So the **idea** is the same as mobile: register device (here, browser subscription) per user, then when “visitor came” the backend sends a push to those subscriptions.

---

## Option 3: Email / SMS (optional)

- **Email**: When you create the Notification (or walk-in), trigger an email to the host’s email (e.g. SendGrid, AWS SES) with the same message. No device token needed; only user email.
- **SMS**: Same idea: when visitor arrives, call an SMS provider (e.g. Twilio) with the host’s phone. Useful if many residents don’t use the app daily.

These are **add-ons** to push; they don’t replace FCM/Web Push for instant in-hand alerts.

---

## Recommended order of implementation

1. **Backend**
   - Add `user_push_tokens` (or similar) and **POST /notifications/register-device** (and optionally unregister).
   - In `checkin_visit()` after creating the `Notification`, add a function like `send_push_to_host(host_id, title, body, data)` that:
     - Loads tokens for `host_id`
     - Sends FCM for `platform in (ios, android)` and Web Push for `platform == 'web'`.
   - (Optional) In `create_walkin_visit()` create a `Notification` for the host and call the same `send_push_to_host` so resident gets “Visitor at gate – approve?” on their device.

2. **Mobile app**
   - After login and FCM token, call **POST /notifications/register-device**.
   - Refresh token on `onTokenRefresh`; unregister on logout if you implement it.

3. **Web app**
   - Add Web Push permission + subscribe; send subscription to **POST /notifications/register-device** (with `platform: 'web'`).
   - Optionally show a “Notify me when visitor arrives” prompt on dashboard for residents.

4. **FCM / Web Push in backend**
   - Use Firebase Admin SDK (or FCM HTTP v1) for FCM.
   - Use **pywebpush** (or equivalent) for Web Push with a VAPID key pair.

---

## Summary

| Question | Answer |
|----------|--------|
| When does “visitor came” happen? | (1) Guard registers walk-in → resident must approve. (2) Visitor checks in with OTP/QR → already creates in-app Notification. |
| How does resident get it on device? | **Push**: FCM for mobile (you already have client code), Web Push for browser. Backend must store tokens and send push when the event happens. |
| What’s missing today? | Backend: device registration API + sending FCM/Web Push when creating a notification (and optionally when creating walk-in). Mobile: call register-device with FCM token. Web: Web Push subscribe + register-device. |

Once the backend has “register device” and “send push to host when this notification is created”, the resident’s device gets the notification as soon as the visitor arrives (check-in or walk-in), even when the app is closed.
