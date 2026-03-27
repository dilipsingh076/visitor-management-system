/**
 * Same rules as mobile `src/lib/api/normalizePath.ts`.
 * FastAPI `@router.get("/")` etc. use a trailing slash; unauthenticated redirects drop Bearer.
 */
const SINGLE_SEGMENT_COLLECTION_ROOTS = new Set([
  "blacklist",
  "buildings",
  "complaints",
  "flats",
  "maintenance",
  "notifications",
  "residents",
  "societies",
  "sos",
  "users",
  "visitors",
]);

export function normalizeApiPath(endpoint: string): string {
  if (!endpoint.startsWith("/")) return endpoint;

  const q = endpoint.indexOf("?");
  const pathOnly = q === -1 ? endpoint : endpoint.slice(0, q);
  const query = q === -1 ? "" : endpoint.slice(q);

  if (pathOnly.endsWith("/")) return endpoint;

  const segments = pathOnly.split("/").filter(Boolean);
  if (segments.length !== 1) return endpoint;

  const root = segments[0];
  if (!root || !SINGLE_SEGMENT_COLLECTION_ROOTS.has(root)) return endpoint;

  return `/${root}/${query}`;
}
