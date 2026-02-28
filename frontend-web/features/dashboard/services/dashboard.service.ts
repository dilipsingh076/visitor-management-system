/**
 * Dashboard feature service. Stats, my requests, recent visits.
 */
import { apiClient } from "@/lib/api";
import { API } from "@/lib/api/endpoints";
import type { DashboardStats, Visit } from "@/types";
import type { MyRequestsResponse } from "../types";

export async function getDashboardStats(): Promise<DashboardStats | null> {
  const res = await apiClient.get<DashboardStats>(API.dashboard.stats);
  return res.data ?? null;
}

export async function getMyRequests(): Promise<MyRequestsResponse | null> {
  const res = await apiClient.get<MyRequestsResponse>(API.dashboard.myRequests);
  return res.data ?? null;
}

export async function getRecentVisits(limit = 20): Promise<Visit[]> {
  const res = await apiClient.get<unknown[]>(`${API.visitors.list}?limit=${limit}`);
  return Array.isArray(res.data) ? (res.data as Visit[]) : [];
}
