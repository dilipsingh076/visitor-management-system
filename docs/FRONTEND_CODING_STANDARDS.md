# Frontend Coding Standards

VMS frontend (Next.js) follows these conventions.

## Theme

- **Design tokens**: Use `styles/theme.css` and `tailwind.config.ts`. Do not hardcode colors.
- **Colors**: `primary`, `primary-hover`, `primary-light`, `primary-muted`, `background`, `foreground`, `muted`, `muted-foreground`, `muted-bg`, `border`, `card`, `success`, `warning`, `error`, `info` and their `-light` variants.
- **Radius**: Use `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl` (from theme `--radius-*`).
- **Shadows**: Use `shadow-soft` or `shadow-card` (not Tailwind defaults `shadow-sm`/`shadow-md`).

## UI Components

Use shared components from `components/ui`:

| Component   | Use for                                   |
|------------|-------------------------------------------|
| `PageHeader` | Page title and description (supports `centered`) |
| `Card`       | Content blocks, feature cards, sections   |
| `Button`     | `<button>` elements                       |
| `LinkButton` | Next.js `Link` styled as button           |
| `Input`      | Form inputs                               |
| `FormField`  | Label + Input + error                     |
| `Badge`      | Status labels                             |
| `StatCard`   | Dashboard stat blocks                     |

## Layout

- **Container**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10` for app pages.
- **Content width**: `max-w-2xl` to `max-w-5xl` for marketing/content pages.
- **Spacing**: Use `mb-8`, `mb-10`, `gap-4`, `gap-6` consistently.

## Patterns

1. **Page structure**: `PageHeader` → content (often in `Card`) → actions (`LinkButton` or `Button`).
2. **Links as buttons**: Use `LinkButton` with `variant="primary"` or `variant="secondary"`.
3. **Text links**: Use `Link` with `className="text-primary font-medium hover:underline"`.
4. **Semantic colors**: `text-foreground`, `text-muted`, `text-muted-foreground` for text; `bg-card`, `border-border` for surfaces.

## File Structure

- `app/` – App Router pages
- `components/layout/` – Header, Footer
- `components/ui/` – Reusable primitives
- `lib/` – API client, auth, types
- `styles/` – theme.css (design tokens)

## Imports

```ts
import { PageHeader, Card, LinkButton } from "@/components/ui";
import { apiClient } from "@/lib/api";
import { API } from "@/lib/api/endpoints";
import { isAuthenticated } from "@/lib/auth";
```
