/**
 * Notifications (visitors feature). Unread list and mark read.
 */
import { apiClient } from "@/lib/api";
import { API } from "@/lib/api/endpoints";
import type { Notification } from "@/types";

export async function getNotifications(params?: { unreadOnly?: boolean }): Promise<Notification[]> {
  const unreadOnly = params?.unreadOnly ?? false;
  const res = await apiClient.get<Notification[]>(
    `${API.notifications.list}?unread_only=${unreadOnly ? "true" : "false"}`
  );
  return Array.isArray(res.data) ? res.data : [];
}

export async function getUnreadNotifications(): Promise<Notification[]> {
  const res = await apiClient.get<Notification[]>(
    `${API.notifications.list}?unread_only=true`
  );
  return Array.isArray(res.data) ? res.data : [];
}

export async function markNotificationRead(id: string): Promise<void> {
  const res = await apiClient.patch(API.notifications.markRead(id));
  if (res.error) throw new Error(res.error);
}

export async function createSocietyNotice(payload: { title: string; body?: string }): Promise<{ created: number }> {
  const res = await apiClient.post<{ created: number }>(API.notifications.createSocietyNotice, payload);
  if (res.error) throw new Error(res.error);
  return (res.data ?? { created: 0 }) as { created: number };
}

/** Local LLM (Ollama) can take minutes on cold start; default API client timeout is 30s. */
const NOTICE_AI_TIMEOUT_MS = 300_000;

export async function generateNoticeMessage(payload: { title: string }): Promise<string> {
  const res = await apiClient.post<{ message: string }>(API.notifications.generateNoticeMessage, payload, {
    timeout: NOTICE_AI_TIMEOUT_MS,
  });
  if (res.error) throw new Error(res.error);
  return res.data?.message ?? "";
}
