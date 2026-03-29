# Website images

Place hero, banner, and marketing images under `public/` so Next.js serves them at `/images/...`.

## Filenames used in the marketing site

| Path | Used for | Suggested real-world shot |
|------|--------------------------|---------------------------|
| `website/hero-bg.jpg` | Home hero background | Wide exterior of gated community, campus, or office |
| `website/apartment-building.jpg` | Gated societies use case | Indian apartment / tower facade |
| `website/office-lobby.jpg` | Corporate offices | Reception / lobby with visitor desk |
| `website/factory.jpg` | Industrial | Gate or plant entrance with safety signage |
| `website/dashboard.jpg` | Product screenshots (optional) | Replace with **your** VMS dashboard export |
| `qr-checkin.jpg` | QR / contactless check-in | Gate phone or tablet showing QR scan |
| `website/qr-scan.jpg` | Same theme, features page | Visitor phone scanning code at gate |
| `guard-dashboard.jpg` | Guard operations | Guard desk or monitor showing queue (blur PII) |
| `website/reception.jpg` | Features hero | Professional reception |
| `website/security.jpg` | Compliance / trust | Access control, CCTV, or security desk |
| `website/team-office.jpg` | About / contact heroes | Team collaboration (stock until you have a team photo) |
| `website/building-modern.jpg` | CTA backgrounds | Modern building skyline |
| `website/mobile-app.jpg` | Mobile coming soon | Hand holding phone at gate (or app shell mock) |

## Aligning with the real product

For the most trustworthy site, replace generic stock with:

1. **Screenshots** of your actual VMS deployment (blur names/phones): dashboard, guard queue, notices, meetings, flats.
2. **On-site photos** of your society or pilot customer gate (with permission).

See **`docs/CONTENT-AND-IMAGES-PROMPT.md`** if present for AI-image prompts and search keywords.

## Download placeholders

```bash
node scripts/download-images.js
```

Replace with your own or AI-generated images when ready; keep the same filenames or update paths in `app/(marketing)/**` components.
