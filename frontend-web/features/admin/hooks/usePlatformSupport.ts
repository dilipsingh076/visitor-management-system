/**
 * Hook for platform support tickets management
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { adminKeys } from "./keys";
import type { SupportTicket, SupportTicketListResponse, SupportStats } from "../types";

interface SupportFilters {
  page?: number;
  page_size?: number;
  search?: string;
  society_id?: string;
  status?: string;
  priority?: string;
  category?: string;
  assigned_to?: string;
}

export function usePlatformSupportList(filters: SupportFilters = {}) {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.page_size) params.set("page_size", String(filters.page_size));
  if (filters.search) params.set("search", filters.search);
  if (filters.society_id) params.set("society_id", filters.society_id);
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.category) params.set("category", filters.category);
  if (filters.assigned_to) params.set("assigned_to", filters.assigned_to);

  return useQuery({
    queryKey: adminKeys.ticketList({ ...filters }),
    queryFn: async (): Promise<SupportTicketListResponse> => {
      const res = await apiClient.get<SupportTicketListResponse>(
        `/admin/support?${params.toString()}`
      );
      if (res.error) throw new Error(res.error);
      return res.data ?? { items: [], total: 0, page: 1, page_size: 20, total_pages: 0 };
    },
  });
}

export function usePlatformSupportStats() {
  return useQuery({
    queryKey: adminKeys.supportStats(),
    queryFn: async (): Promise<SupportStats> => {
      const res = await apiClient.get<SupportStats>("/admin/support/stats");
      if (res.error) throw new Error(res.error);
      return (
        res.data ?? {
          total: 0,
          open: 0,
          in_progress: 0,
          resolved: 0,
          by_category: {},
          by_priority: {},
          avg_resolution_time_hours: null,
        }
      );
    },
  });
}

export function usePlatformSupportDetail(id: string) {
  return useQuery({
    queryKey: adminKeys.ticketDetail(id),
    queryFn: async (): Promise<SupportTicket | null> => {
      const res = await apiClient.get<SupportTicket>(`/admin/support/${id}`);
      if (res.error) throw new Error(res.error);
      return res.data ?? null;
    },
    enabled: !!id,
  });
}

export function useUpdateSupportTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SupportTicket> }) => {
      const res = await apiClient.patch<SupportTicket>(`/admin/support/${id}`, data);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.support() });
    },
  });
}

export function useAddTicketMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      message,
      attachments,
    }: {
      id: string;
      message: string;
      attachments?: string;
    }) => {
      const res = await apiClient.post(`/admin/support/${id}/messages`, {
        message,
        attachments,
      });
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.ticketDetail(id) });
    },
  });
}

export function useCloseTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post(`/admin/support/${id}/close`);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.support() });
    },
  });
}
