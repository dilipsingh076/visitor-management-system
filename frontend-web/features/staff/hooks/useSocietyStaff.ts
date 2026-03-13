"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { API } from "@/lib/api/endpoints";
import type {
  MaintenanceStaff,
  MaintenanceStaffCreateInput,
  MaintenanceStaffUpdateInput,
} from "../types";

export const staffKeys = {
  all: ["society-staff"] as const,
  list: (role?: string) => [...staffKeys.all, "list", role] as const,
  detail: (id: string) => [...staffKeys.all, "detail", id] as const,
};

export function useSocietyStaff(role?: string) {
  return useQuery({
    queryKey: staffKeys.list(role),
    queryFn: async (): Promise<MaintenanceStaff[]> => {
      const url = role ? `${API.societyStaff.list}?role=${encodeURIComponent(role)}` : API.societyStaff.list;
      const res = await apiClient.get<MaintenanceStaff[]>(url);
      return Array.isArray(res.data) ? res.data : [];
    },
  });
}

export function useCreateSocietyStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: MaintenanceStaffCreateInput): Promise<MaintenanceStaff> => {
      const res = await apiClient.post<MaintenanceStaff>(API.societyStaff.create, input);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.all });
    },
  });
}

export function useUpdateSocietyStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: MaintenanceStaffUpdateInput;
    }): Promise<MaintenanceStaff> => {
      const res = await apiClient.patch<MaintenanceStaff>(API.societyStaff.update(id), data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.all });
    },
  });
}

export function useDeleteSocietyStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(API.societyStaff.delete(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.all });
    },
  });
}
