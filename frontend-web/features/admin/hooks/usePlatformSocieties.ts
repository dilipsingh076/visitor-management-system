/**
 * Hook for platform societies management
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { adminKeys } from "./keys";
import type { PlatformSociety, PlatformSocietyListResponse } from "../types";

interface SocietiesFilters {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  is_active?: boolean;
}

export function usePlatformSocietiesList(filters: SocietiesFilters = {}) {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.page_size) params.set("page_size", String(filters.page_size));
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.is_active !== undefined) params.set("is_active", String(filters.is_active));

  return useQuery({
    queryKey: adminKeys.societyList({ ...filters }),
    queryFn: async (): Promise<PlatformSocietyListResponse> => {
      const res = await apiClient.get<PlatformSocietyListResponse>(
        `/admin/societies?${params.toString()}`
      );
      if (res.error) throw new Error(res.error);
      return res.data ?? { items: [], total: 0, page: 1, page_size: 20, total_pages: 0 };
    },
  });
}

export function usePlatformSocietyDetail(id: string) {
  return useQuery({
    queryKey: adminKeys.societyDetail(id),
    queryFn: async (): Promise<PlatformSociety | null> => {
      const res = await apiClient.get<PlatformSociety>(`/admin/societies/${id}`);
      if (res.error) throw new Error(res.error);
      return res.data ?? null;
    },
    enabled: !!id,
  });
}

export function useUpdateSociety() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<PlatformSociety>;
    }) => {
      const res = await apiClient.patch<PlatformSociety>(`/admin/societies/${id}`, data);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.societies() });
    },
  });
}

export function useActivateSociety() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post(`/admin/societies/${id}/activate`);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.societies() });
    },
  });
}

export function useDeactivateSociety() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post(`/admin/societies/${id}/deactivate`);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.societies() });
    },
  });
}

export function useAssignSocietyAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      societyId,
      data,
    }: {
      societyId: string;
      data: { user_id?: string; email?: string; full_name?: string; phone?: string; role?: string };
    }) => {
      const res = await apiClient.post(`/admin/societies/${societyId}/assign-admin`, data);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.societies() });
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    },
  });
}
