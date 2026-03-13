/**
 * Hook for platform dashboard data
 */
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { adminKeys } from "./keys";
import type { PlatformDashboardResponse } from "../types";

export function usePlatformDashboard() {
  return useQuery({
    queryKey: adminKeys.dashboard(),
    queryFn: async (): Promise<PlatformDashboardResponse | null> => {
      const res = await apiClient.get<PlatformDashboardResponse>("/admin/dashboard");
      if (res.error) {
        throw new Error(res.error);
      }
      return res.data ?? null;
    },
  });
}
