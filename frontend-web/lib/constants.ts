/**
 * App-wide constants. Keeps magic numbers and config in one place.
 */

export const GUARD_POLL_INTERVAL_MS = 30_000;
export const PHONE_DIGITS = 10;
export const VISITORS_LIST_LIMIT = 50;
export const RESIDENTS_LIST_LIMIT = 100;

export const API_BASE_URL =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : "http://localhost:8000/api/v1";
