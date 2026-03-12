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
