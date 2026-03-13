"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { API } from "@/lib/api/endpoints";
import type {
  Complaint,
  ComplaintListResponse,
  ComplaintStats,
  ComplaintCreateInput,
  ComplaintUpdateInput,
  ComplaintComment,
} from "../types";

export const societyComplaintsKeys = {
  all: ["society-complaints"] as const,
  list: (filters: Record<string, unknown>) =>
    [...societyComplaintsKeys.all, "list", filters] as const,
  stats: () => [...societyComplaintsKeys.all, "stats"] as const,
  detail: (id: string) => [...societyComplaintsKeys.all, "detail", id] as const,
  comments: (id: string) => [...societyComplaintsKeys.all, "comments", id] as const,
};

interface UseComplaintsListParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  priority?: string;
  category?: string;
  enabled?: boolean;
}

export function useSocietyComplaintsList(params: UseComplaintsListParams = {}) {
  const { enabled = true, ...filters } = params;
  return useQuery({
    queryKey: societyComplaintsKeys.list(filters),
    queryFn: async (): Promise<ComplaintListResponse> => {
      const queryParams = new URLSearchParams();
      if (filters.page) queryParams.set("page", String(filters.page));
      if (filters.page_size) queryParams.set("page_size", String(filters.page_size));
      if (filters.search) queryParams.set("search", filters.search);
      if (filters.status) queryParams.set("status", filters.status);
      if (filters.priority) queryParams.set("priority", filters.priority);
      if (filters.category) queryParams.set("category", filters.category);

      const url = `${API.societyComplaints.list}?${queryParams.toString()}`;
      const res = await apiClient.get<ComplaintListResponse>(url);
      return (
        res.data ?? {
          items: [],
          total: 0,
          page: filters.page ?? 1,
          page_size: filters.page_size ?? 20,
          total_pages: 0,
        }
      );
    },
    enabled,
  });
}

export function useSocietyComplaintStats() {
  return useQuery({
    queryKey: societyComplaintsKeys.stats(),
    queryFn: async (): Promise<ComplaintStats> => {
      const res = await apiClient.get<ComplaintStats>(API.societyComplaints.stats);
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

export function useSocietyComplaint(id: string | null | undefined) {
  return useQuery({
    queryKey: societyComplaintsKeys.detail(id ?? ""),
    queryFn: async (): Promise<Complaint> => {
      const res = await apiClient.get<Complaint>(API.societyComplaints.get(id!));
      if (!res.data) {
        throw new Error("Complaint not found");
      }
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateSocietyComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ComplaintCreateInput): Promise<Complaint> => {
      const res = await apiClient.post<Complaint>(API.societyComplaints.create, input);
      if (!res.data) {
        throw new Error("Failed to create complaint");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: societyComplaintsKeys.all });
    },
  });
}

export function useUpdateSocietyComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: ComplaintUpdateInput;
    }): Promise<Complaint> => {
      const res = await apiClient.patch<Complaint>(API.societyComplaints.update(id), data);
      if (!res.data) {
        throw new Error("Failed to update complaint");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: societyComplaintsKeys.all });
    },
  });
}

export function useSocietyComplaintComments(id: string | null | undefined) {
  return useQuery({
    queryKey: societyComplaintsKeys.comments(id ?? ""),
    queryFn: async (): Promise<{ items: ComplaintComment[] }> => {
      const res = await apiClient.get<{ items: ComplaintComment[] }>(
        API.societyComplaints.comments(id!)
      );
      return res.data ?? { items: [] };
    },
    enabled: !!id,
  });
}

export function useAddSocietyComplaintComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      complaintId,
      comment,
    }: {
      complaintId: string;
      comment: string;
    }): Promise<ComplaintComment> => {
      const res = await apiClient.post<ComplaintComment>(
        API.societyComplaints.comments(complaintId),
        { comment }
      );
      if (!res.data) {
        throw new Error("Failed to add comment");
      }
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: societyComplaintsKeys.comments(variables.complaintId),
      });
    },
  });
}
