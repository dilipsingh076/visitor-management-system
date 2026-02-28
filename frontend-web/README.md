# VMS Frontend Web (Next.js)

Next.js 15+ frontend dashboard for the Visitor Management System.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env.local` and configure:
```bash
cp .env.example .env.local
# Edit .env.local with your settings
```

3. Run development server:
```bash
npm run dev
```

The app will be available at http://localhost:3000

## Project Structure

```
frontend-web/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx
│   ├── page.tsx
│   ├── login/
│   └── dashboard/
├── components/             # React components
│   └── layout/
├── lib/                    # Utilities
│   ├── api.ts             # API client
│   └── auth.ts            # Auth utilities
├── public/                 # Static assets
│   └── images/             # Hero, banner, about (run scripts/download-images.js to populate)
├── scripts/
│   └── download-images.js  # Fetches royalty-free placeholders into public/images
```

## Features

- Server Components (Next.js 15+)
- TypeScript
- Tailwind CSS
- Keycloak authentication integration
- Responsive design

## Development

- Use TypeScript for all components
- Follow Next.js App Router conventions
- Use Tailwind CSS for styling
- API calls via `lib/api.ts` client
