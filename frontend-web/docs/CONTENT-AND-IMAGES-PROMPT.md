# VMS Website: Content & Images Prompt

Use this prompt for AI image generators, stock photo searches, or copywriting so that **images and content are clearly related to our application**: a **Visitor Management System (VMS)** for **India** — gated societies, corporate offices, factories, and campuses. **Current issues**: content is thin and generic; images are unrelated (random scenery). Goal: **application-relevant imagery** and **richer, benefit-focused copy**.

---

## Product summary (for context)

- **What**: Digital visitor check-in: pre-approval (invite with OTP/QR), contactless check-in at gate/reception, guard walk-in registration, blacklist, muster export, host notifications. **DPDP Act 2023 compliant** (consent, audit, data erasure).
- **Who**: Residents (hosts), Visitors (guests), Guards (reception/security). Deployments: **gated societies & apartments**, **corporate offices**, **factories & warehouses**, **schools & campuses**.
- **Where**: India-focused (language, compliance, WhatsApp optional).
- **Tone**: Professional, trustworthy, security-aware, simple to use. Emphasize safety, compliance, and ease for residents and guards.

---

## Image requirements (by file / placement)

Request or search for images that match these themes. Prefer **realistic, professional** photos (not cartoon or heavy filters). Avoid generic nature/travel; every image should suggest **reception, security, building entrance, or visitor flow**.

| File / placement | Suggested search terms / prompt | Purpose |
|------------------|---------------------------------|--------|
| **hero.jpg** (home hero background) | "Modern office or apartment building entrance with reception or security desk, daytime, professional, India or neutral"; "Corporate lobby with security desk and visitors"; "Gated society main gate with guard cabin" | First impression: secure, organized entry. |
| **banner.jpg** | "Security guard at reception or gate"; "Visitor check-in desk with tablet or kiosk"; "Building entrance with security" | Secondary hero or section banner. |
| **building.jpg** (about page) | "Corporate office building exterior or modern apartment tower"; "Professional building facade, daytime" | About us: who we serve (offices, societies). |
| **security.jpg** | "Security guard at desk or gate"; "Receptionist at visitor desk"; "Entrance with visitor sign-in" | Trust / security section. |
| **office.jpg** | "Office reception lobby with seating"; "Modern office entrance lobby"; "Visitor waiting area" | Use case: corporate offices. |
| **placeholder-card.jpg** | "Visitor checking in on tablet"; "QR code scan at entrance"; "Reception desk with visitor log" | Feature cards or check-in flow. |

**Prompt for AI image generators (e.g. DALL·E, Midjourney):**  
*"Professional photograph of [scene from table]. Clean, modern, well-lit. Suggests visitor management or secure building entry. No text or logos. Photorealistic, suitable for a B2B visitor management system website."*

---

## Content guidelines

- **Headlines**: Clear benefit or outcome (e.g. "Secure visitor check-in for societies and offices", "DPDP-compliant from day one").
- **Body**: Expand with **who it’s for**, **what problem it solves**, and **one concrete outcome** (e.g. "Residents invite guests from the app; visitors check in with OTP or QR at the gate; guards see live list and check them out when they leave.").
- **India-specific**: Mention gated societies, DPDP, optional WhatsApp, OTP/QR, and use cases (societies, offices, factories, campuses).
- **Trust**: Use short, scannable lines for compliance (DPDP), contactless (QR/OTP), real-time, India-optimized.
- **CTAs**: Action-oriented: "Get started", "See how it works", "Try for your society".

---

## Page-by-page content ideas (expand on site)

- **Home hero**: Headline + one sentence on contactless check-in and pre-approval; subtext on societies, offices, factories; CTA "Get started" / "How it works".
- **Home – Why choose VMS**: 3 cards: Pre-approval & invite (residents send OTP/QR, optional WhatsApp); Contactless check-in (QR/OTP at gate, host notified, muster export); DPDP compliant (consent, audit log, data erasure). Add 1–2 sentence benefit each.
- **Home – How it works**: 4 steps (Invite → Arrive → Check-in → Check-out) with one line each; link to detailed How it works page.
- **About**: What VMS is; India-optimized; pre-approval, QR/OTP, guard walk-in, blacklist, muster; DPDP; three roles (Resident, Guard, Visitor). Optional: one line on tech (FastAPI, Next.js, React Native).
- **Features**: Each feature with title + 2 sentences (what it does + why it matters). E.g. Pre-approval: residents invite with OTP/QR; optional WhatsApp; fewer surprises at gate.
- **How it works**: Resident flow (invite, share OTP/QR, approve walk-ins, get notified); Visitor flow (receive OTP/QR, enter or scan at gate, consent, get checked out); Guard flow (register walk-ins, dashboard, check-out, blacklist, muster). Keep steps short and scannable.
- **Use cases**: Societies (residents invite, OTP/QR check-in, guards, muster); Offices (pre-approved meetings, vendors, DPDP); Factories (contractors, delivery, time-bound, muster); Schools (parents, guests, approval, emergency muster). One short paragraph each.
- **FAQ**: Keep answers 2–4 sentences. Add if needed: "Who can use VMS?", "Is data stored in India?", "Can we use our own WhatsApp?"
- **Contact**: Support (check-in/tech), Sales (deploy for society/office), Privacy (DPDP/data). Keep tone helpful and professional.

---

## Checklist before publishing

- [ ] All images suggest **reception / security / building entrance / visitor flow** (no unrelated scenery).
- [ ] Hero and key sections have **expanded, benefit-focused copy** (not one-line placeholders).
- [ ] **India** and **DPDP** mentioned where relevant (hero, about, features, privacy).
- [ ] Use cases clearly name **societies, offices, factories, campuses** with one concrete benefit each.
- [ ] CTAs are clear (Get started, How it works, See features, Contact).

---

## Implementation status (on site)

| Item | Status |
|------|--------|
| **Images** | ✅ Downloaded VMS-relevant images from Pexels API (office, security, reception, technology, computer, building). Images placed throughout site (hero, features banner, how-it-works grids, use-cases tiles, about, contact). |
| **Layout** | ✅ Removed narrow max-w constraints; all pages now use full-width container for better screen utilization. |
| **Home hero** | ✅ Headline, contactless + pre-approval copy, societies/offices/factories/campuses, DPDP, CTAs (Get started, How it works). Full-width hero with background image. |
| **Home – Why choose VMS** | ✅ Three cards (Pre-approval, Contactless check-in, DPDP) with 1–2 sentence benefits; India/DPDP intro line. |
| **Home – How it works** | ✅ Four steps with descriptions; links to How it works, Features, Use cases. |
| **About** | ✅ What VMS is; India-optimized; pre-approval, QR/OTP, guard walk-in, blacklist, muster; DPDP; three roles; tech (FastAPI, Next.js, React Native). Large contextual image. Page metadata. |
| **Features** | ✅ Eight features with title + 2 sentences each. DPDP/compliance in description. Hero banner image with overlay text. CTAs: Get started, See use cases, Try for your society. Page metadata. |
| **How it works** | ✅ Resident, Visitor, Guard flows with short intros and step-by-step copy. Visual flow section with two images (mobile check-in, guard dashboard). CTAs. Page metadata. |
| **Use cases** | ✅ Societies, Offices, Factories, Schools – one paragraph each with concrete benefits. Three image tiles (building, office, security) with overlays. Page metadata. |
| **FAQ** | ✅ Seven questions including: check-in, walk-in, DPDP, muster, Who can use VMS?, Is data stored in India?, Can we use our own WhatsApp? |
| **Contact** | ✅ Support, Sales, Privacy & compliance – expanded copy. Office reception banner image with overlay. Page metadata. |
| **Privacy & DPDP** | ✅ Data we collect, Explicit consent, Retention & deletion, **Data residency** (India/hosting), Security. |
| **CTAs site-wide** | ✅ Get started, How it works, See features / See use cases, Contact, Try for your society (Features). |
| **Metadata** | ✅ Root layout: India, DPDP, societies/offices. About, Features, How it works, Use cases, Contact: page-level title + description. |
