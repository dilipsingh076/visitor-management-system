/**
 * Hook for platform complaints management
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { adminKeys } from "./keys";
import type { Complaint, ComplaintListResponse, ComplaintStats } from "../types";

interface ComplaintsFilters {
  page?: number;
  page_size?: number;
  search?: string;
  society_id?: string;
  status?: string;
  priority?: string;
  category?: string;
  escalated?: boolean;
}

export function usePlatformComplaintsList(filters: ComplaintsFilters = {}) {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.page_size) params.set("page_size", String(filters.page_size));
  if (filters.search) params.set("search", filters.search);
  if (filters.society_id) params.set("society_id", filters.society_id);
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.category) params.set("category", filters.category);
  if (filters.escalated !== undefined) params.set("escalated", String(filters.escalated));

  return useQuery({
    queryKey: adminKeys.complaintList({ ...filters }),
    queryFn: async (): Promise<ComplaintListResponse> => {
      const res = await apiClient.get<ComplaintListResponse>(
        `/admin/complaints?${params.toString()}`
      );
      if (res.error) throw new Error(res.error);
      return res.data ?? { items: [], total: 0, page: 1, page_size: 20, total_pages: 0 };
    },
  });
}

export function usePlatformComplaintStats() {
  return useQuery({
    queryKey: adminKeys.complaintStats(),
    queryFn: async (): Promise<ComplaintStats> => {
      const res = await apiClient.get<ComplaintStats>("/admin/complaints/stats");
      if (res.error) throw new Error(res.error);
      return (
        res.data ?? {
          total: 0,
          open: 0,
          in_progress: 0,
          resolved: 0,
          escalated: 0,
          by_category: {},
          by_priority: {},
        }
      );
    },
  });
}

export function usePlatformComplaintDetail(id: string) {
  return useQuery({
    queryKey: adminKeys.complaintDetail(id),
    queryFn: async (): Promise<Complaint | null> => {
      const res = await apiClient.get<Complaint>(`/admin/complaints/${id}`);
      if (res.error) throw new Error(res.error);
      return res.data ?? null;
    },
    enabled: !!id,
  });
}

export function useUpdateComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Complaint> }) => {
      const res = await apiClient.patch<Complaint>(`/admin/complaints/${id}`, data);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.complaints() });
    },
  });
}

export function useEscalateComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await apiClient.post(`/admin/complaints/${id}/escalate`, {
        escalation_reason: reason,
      });
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.complaints() });
    },
  });
}

export function useAddComplaintComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      comment,
      is_internal,
    }: {
      id: string;
      comment: string;
      is_internal?: boolean;
    }) => {
      const res = await apiClient.post(`/admin/complaints/${id}/comments`, {
        comment,
        is_internal: is_internal ?? false,
      });
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.complaintDetail(id) });
    },
  });
}
