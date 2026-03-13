/**
 * Hook for platform settings and announcements
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { adminKeys } from "./keys";
import type { Announcement, SystemSetting } from "../types";

// Announcements
export function usePlatformAnnouncements(includeInactive = false) {
  return useQuery({
    queryKey: adminKeys.announcements(),
    queryFn: async (): Promise<Announcement[]> => {
      const res = await apiClient.get<Announcement[]>(
        `/admin/announcements?include_inactive=${includeInactive}`
      );
      if (res.error) throw new Error(res.error);
      return res.data ?? [];
    },
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Announcement>) => {
      const res = await apiClient.post<Announcement>("/admin/announcements", data);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.announcements() });
    },
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Announcement> }) => {
      const res = await apiClient.patch<Announcement>(`/admin/announcements/${id}`, data);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.announcements() });
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/admin/announcements/${id}`);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.announcements() });
    },
  });
}

// System Settings
export function usePlatformSettings(category?: string) {
  return useQuery({
    queryKey: adminKeys.systemSettings(category),
    queryFn: async (): Promise<SystemSetting[]> => {
      const params = category ? `?category=${category}` : "";
      const res = await apiClient.get<SystemSetting[]>(`/admin/settings${params}`);
      if (res.error) throw new Error(res.error);
      return res.data ?? [];
    },
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value, description }: { key: string; value: string; description?: string }) => {
      const res = await apiClient.put<SystemSetting>(`/admin/settings/${key}`, {
        value,
        description,
      });
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.settings() });
    },
  });
}

export function useBulkUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: { key: string; value: string }[]) => {
      const res = await apiClient.post<SystemSetting[]>("/admin/settings/bulk", { settings });
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.settings() });
    },
  });
}
