/**
 * Hook for platform users management
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { adminKeys } from "./keys";
import type { PlatformUser, PlatformUserListResponse } from "../types";

interface UsersFilters {
  page?: number;
  page_size?: number;
  search?: string;
  role?: string;
  is_active?: boolean;
  society_id?: string;
}

export function usePlatformUsersList(filters: UsersFilters = {}) {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.page_size) params.set("page_size", String(filters.page_size));
  if (filters.search) params.set("search", filters.search);
  if (filters.role) params.set("role", filters.role);
  if (filters.is_active !== undefined) params.set("is_active", String(filters.is_active));
  if (filters.society_id) params.set("society_id", filters.society_id);

  return useQuery({
    queryKey: adminKeys.userList({ ...filters }),
    queryFn: async (): Promise<PlatformUserListResponse> => {
      const res = await apiClient.get<PlatformUserListResponse>(
        `/admin/users?${params.toString()}`
      );
      if (res.error) throw new Error(res.error);
      return res.data ?? { items: [], total: 0, page: 1, page_size: 20, total_pages: 0 };
    },
  });
}

export function usePlatformUserDetail(id: string) {
  return useQuery({
    queryKey: adminKeys.userDetail(id),
    queryFn: async (): Promise<PlatformUser | null> => {
      const res = await apiClient.get<PlatformUser>(`/admin/users/${id}`);
      if (res.error) throw new Error(res.error);
      return res.data ?? null;
    },
    enabled: !!id,
  });
}

export function useUpdatePlatformUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { is_active?: boolean; is_verified?: boolean; role?: string; roles?: string[] };
    }) => {
      const res = await apiClient.patch<PlatformUser>(`/admin/users/${id}`, data);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    },
  });
}

export function useBlockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post(`/admin/users/${id}/block`);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    },
  });
}

export function useUnblockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post(`/admin/users/${id}/unblock`);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    },
  });
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: async ({ id, new_password }: { id: string; new_password: string }) => {
      const res = await apiClient.post(`/admin/users/${id}/reset-password`, { new_password });
      if (res.error) throw new Error(res.error);
      return res.data;
    },
  });
}

export function useVerifyUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post(`/admin/users/${id}/verify`);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    },
  });
}
