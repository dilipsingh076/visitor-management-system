"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { API } from "@/lib/api/endpoints";
import type { Amenity, AmenityCreateInput, AmenityUpdateInput } from "../types";

export const amenitiesKeys = {
  all: ["society-amenities"] as const,
  list: (status?: string) => [...amenitiesKeys.all, "list", status] as const,
  detail: (id: string) => [...amenitiesKeys.all, "detail", id] as const,
};

export function useSocietyAmenities(status?: string) {
  return useQuery({
    queryKey: amenitiesKeys.list(status),
    queryFn: async (): Promise<Amenity[]> => {
      const url = status ? `${API.societyAmenities.list}?status=${status}` : API.societyAmenities.list;
      const res = await apiClient.get<Amenity[]>(url);
      return Array.isArray(res.data) ? res.data : [];
    },
  });
}

export function useCreateSocietyAmenity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: AmenityCreateInput): Promise<Amenity> => {
      const res = await apiClient.post<Amenity>(API.societyAmenities.create, input);
      if (!res.data) {
        throw new Error("Failed to create amenity");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: amenitiesKeys.all });
    },
  });
}

export function useUpdateSocietyAmenity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AmenityUpdateInput }): Promise<Amenity> => {
      const res = await apiClient.patch<Amenity>(API.societyAmenities.update(id), data);
      if (!res.data) {
        throw new Error("Failed to update amenity");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: amenitiesKeys.all });
    },
  });
}

export function useDeleteSocietyAmenity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(API.societyAmenities.delete(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: amenitiesKeys.all });
    },
  });
}
