"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardStats, getMyRequests, getRecentVisits } from "../services";
import { dashboardKeys } from "./keys";

export function useDashboardStats(enabled: boolean) {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    enabled,
    queryFn: getDashboardStats,
  });
}

export function useDashboardMyRequests(enabled: boolean) {
  return useQuery({
    queryKey: dashboardKeys.myRequests(),
    enabled,
    queryFn: getMyRequests,
  });
}

export function useRecentVisits(params: { enabled: boolean; limit?: number }) {
  const { enabled, limit = 20 } = params;
  return useQuery({
    queryKey: dashboardKeys.recentVisits(limit),
    enabled,
    queryFn: () => getRecentVisits(limit),
  });
}

