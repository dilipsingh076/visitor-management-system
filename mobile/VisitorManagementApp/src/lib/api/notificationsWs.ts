import { API_BASE_URL } from '../../config/api';

/**
 * Same URL shape as frontend-web `getNotificationsWsUrl()`:
 * http(s) API base → ws(s), path `/notifications/ws` (base already includes `/api/v1`).
 */
export function getNotificationsWebSocketUrl(): string | null {
  if (!API_BASE_URL) return null;
  const wsBase = API_BASE_URL.replace(/^https:\/\//i, 'wss://').replace(/^http:\/\//i, 'ws://');
  return `${wsBase}/notifications/ws`;
}
