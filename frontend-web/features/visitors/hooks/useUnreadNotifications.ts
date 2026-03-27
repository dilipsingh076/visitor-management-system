"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Notification } from "@/types";
import { getNotifications, getUnreadNotifications, markNotificationRead, createSocietyNotice, generateNoticeMessage } from "../services";
import { notificationsKeys } from "./keys";
import { useEffect } from "react";
import { ensureValidAccessToken } from "@/lib/auth";
import { sosKeys } from "@/features/sos";

export function useUnreadNotifications(enabled: boolean) {
  return useQuery({
    queryKey: notificationsKeys.unread(),
    enabled,
    queryFn: getUnreadNotifications,
  });
}

/**
 * Build WebSocket URL from API base (http(s) -> ws(s)).
 */
function getNotificationsWsUrl(): string | null {
  if (typeof window === "undefined") return null;
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
  const wsBase = base.replace(/^https:\/\//i, "wss://").replace(/^http:\/\//i, "ws://");
  return `${wsBase}/notifications/ws`;
}

export function useNotificationsStream(enabled: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const wsUrl = getNotificationsWsUrl();
    if (!wsUrl) return;

    let ws: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;
    let reconnectDelay = 1000;
    const maxReconnectDelay = 30000;

    async function connect() {
      if (cancelled) return;
      // Same as apiClient: refresh access token if expired / near expiry, so WS query token stays valid.
      await ensureValidAccessToken();
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      if (!token) {
        scheduleReconnect();
        return;
      }
      const url = `${wsUrl}?token=${encodeURIComponent(token)}`;
      try {
        ws = new WebSocket(url);
      } catch {
        scheduleReconnect();
        return;
      }

      ws.onopen = () => {
        reconnectDelay = 1000;
        // On (re)connect, refresh all data to catch anything missed while disconnected
        queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
        queryClient.invalidateQueries({ queryKey: sosKeys.active() });
        queryClient.invalidateQueries({ queryKey: ["visitors"] });
        queryClient.invalidateQueries({ queryKey: ["guard"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data as string);
          if (data?.event === "notification" || data?.payload?.event === "notification") {
            // Notifications update instantly
            queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
            queryClient.invalidateQueries({ queryKey: sosKeys.active() });
            // Slight delay for data queries so the DB transaction commits first
            setTimeout(() => {
              queryClient.invalidateQueries({ queryKey: ["visitors"] });
              queryClient.invalidateQueries({ queryKey: ["guard"] });
              queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            }, 600);
          }
        } catch {
          // ignore parse errors
        }
      };

      ws.onclose = () => {
        ws = null;
        if (!cancelled) scheduleReconnect();
      };

      ws.onerror = () => {
        // onclose will run after
      };
    }

    function scheduleReconnect() {
      if (cancelled) return;
      reconnectTimeout = setTimeout(() => {
        reconnectTimeout = null;
        void connect();
        reconnectDelay = Math.min(reconnectDelay * 2, maxReconnectDelay);
      }, reconnectDelay);
    }

    void connect();

    return () => {
      cancelled = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, [enabled, queryClient]);
}

export function useNotifications(params: { enabled: boolean; unreadOnly?: boolean }) {
  const { enabled, unreadOnly = false } = params;
  return useQuery({
    queryKey: [...notificationsKeys.all, "list", { unreadOnly }] as const,
    enabled,
    queryFn: () => getNotifications({ unreadOnly }),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await markNotificationRead(id);
      return true;
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: notificationsKeys.unread() });
      const prev =
        queryClient.getQueryData<Notification[]>(notificationsKeys.unread()) ??
        [];
      queryClient.setQueryData<Notification[]>(
        notificationsKeys.unread(),
        prev.filter((n) => n.id !== id)
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(notificationsKeys.unread(), ctx.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.unread() });
    },
  });
}

export function useCreateSocietyNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSocietyNotice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
    },
  });
}

export function useGenerateNoticeMessage() {
  return useMutation({
    mutationFn: generateNoticeMessage,
  });
}

