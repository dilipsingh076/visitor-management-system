import { useEffect, useRef } from 'react';
import { getNotificationsWebSocketUrl } from '../lib/api/notificationsWs';
import { apiClient } from '../config/api';
import { API } from '../lib/api/endpoints';
import { getSecureToken } from '../lib/secureStorage';
import { emitNotificationRealtime } from '../lib/realtimeEvents';

/**
 * Mirrors frontend-web `useNotificationsStream`: connects to `/api/v1/notifications/ws?token=...`,
 * refreshes access token via `GET /auth/me` before connecting (same as web `ensureValidAccessToken` + WS).
 * Emits {@link NOTIFICATION_REALTIME_EVENT} on connect and on notification payloads.
 */
export function useNotificationsStream(enabled: boolean): void {
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  useEffect(() => {
    if (!enabled) return;

    /** RN global WebSocket (avoid Node/undici `WebSocket` typing clash). */
    let activeWs: InstanceType<typeof globalThis.WebSocket> | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;
    let reconnectDelay = 1000;
    const maxReconnectDelay = 30000;

    function scheduleReconnect() {
      if (cancelled) return;
      reconnectTimeout = setTimeout(() => {
        reconnectTimeout = null;
        void connect();
        reconnectDelay = Math.min(reconnectDelay * 2, maxReconnectDelay);
      }, reconnectDelay);
    }

    async function connect() {
      if (cancelled || !enabledRef.current) return;

      await apiClient.get(API.auth.me);

      const token = await getSecureToken();
      if (!token) {
        scheduleReconnect();
        return;
      }

      const wsUrl = getNotificationsWebSocketUrl();
      if (!wsUrl) {
        scheduleReconnect();
        return;
      }

      const url = `${wsUrl}?token=${encodeURIComponent(token)}`;

      let socket: InstanceType<typeof globalThis.WebSocket>;
      try {
        socket = new globalThis.WebSocket(url);
      } catch {
        scheduleReconnect();
        return;
      }
      activeWs = socket;

      socket.onopen = () => {
        reconnectDelay = 1000;
        emitNotificationRealtime();
      };

      socket.onmessage = (event: { data?: string }) => {
        try {
          const data = JSON.parse(String(event.data ?? ''));
          if (
            data?.event === 'notification' ||
            data?.payload?.event === 'notification'
          ) {
            emitNotificationRealtime();
          }
        } catch {
          // ignore parse errors
        }
      };

      socket.onclose = () => {
        activeWs = null;
        if (!cancelled && enabledRef.current) scheduleReconnect();
      };

      socket.onerror = () => {
        // onclose follows
      };
    }

    void connect();

    return () => {
      cancelled = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (activeWs) {
        activeWs.close();
        activeWs = null;
      }
    };
  }, [enabled]);
}
