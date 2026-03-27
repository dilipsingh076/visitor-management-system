/**
 * FastAPI mounts collection list handlers as `@router.get("/")` under a prefix, so the
 * canonical path includes a trailing slash (e.g. `/api/v1/notifications/`).
 *
 * Calling `/notifications` (no slash) returns 307 → `/notifications/`. Many clients
 * (including React Native `fetch`) do not attach `Authorization` to the redirected
 * request, which produces 401 and can trigger logout / cascade failures.
 *
 * Single-segment roots below are normalized to `/<root>/` before the query string.
 *
 * Do not add `nearby-places`: FastAPI serves it without a trailing slash; requesting
 * `.../nearby-places/` returns 307 and `fetch` may omit `Authorization` on the redirect.
 */
const SINGLE_SEGMENT_COLLECTION_ROOTS = new Set([
  'blacklist',
  'buildings',
  'complaints',
  'flats',
  'maintenance',
  'notifications',
  'residents',
  'societies',
  'sos',
  'users',
  'visitors',
]);

export function normalizeApiPath(endpoint: string): string {
  if (!endpoint.startsWith('/')) return endpoint;

  const q = endpoint.indexOf('?');
  const pathOnly = q === -1 ? endpoint : endpoint.slice(0, q);
  const query = q === -1 ? '' : endpoint.slice(q);

  if (pathOnly.endsWith('/')) return endpoint;

  const segments = pathOnly.split('/').filter(Boolean);
  if (segments.length !== 1) return endpoint;

  const root = segments[0];
  if (!root || !SINGLE_SEGMENT_COLLECTION_ROOTS.has(root)) return endpoint;

  return `/${root}/${query}`;
}
