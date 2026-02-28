"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { API } from "@/lib/api/endpoints";
import type { Resident } from "@/types";

export const residentsKeys = {
  all: ["residents"] as const,
  list: () => [...residentsKeys.all, "list"] as const,
};

export function useResidents() {
  return useQuery({
    queryKey: residentsKeys.list(),
    queryFn: async (): Promise<Resident[]> => {
      const res = await apiClient.get<Resident[]>(API.residents.list);
      return Array.isArray(res.data) ? res.data : [];
    },
  });
}
