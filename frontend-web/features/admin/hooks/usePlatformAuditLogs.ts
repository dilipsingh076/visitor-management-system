/**
 * Hook for platform audit logs
 */
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { adminKeys } from "./keys";
import type { AuditLogListResponse } from "../types";

interface AuditLogsFilters {
  page?: number;
  page_size?: number;
  user_id?: string;
  action?: string;
  start_date?: string;
  end_date?: string;
}

export function usePlatformAuditLogs(filters: AuditLogsFilters = {}) {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.page_size) params.set("page_size", String(filters.page_size));
  if (filters.user_id) params.set("user_id", filters.user_id);
  if (filters.action) params.set("action", filters.action);
  if (filters.start_date) params.set("start_date", filters.start_date);
  if (filters.end_date) params.set("end_date", filters.end_date);

  return useQuery({
    queryKey: adminKeys.auditLogList({ ...filters }),
    queryFn: async (): Promise<AuditLogListResponse> => {
      const res = await apiClient.get<AuditLogListResponse>(
        `/admin/audit-logs?${params.toString()}`
      );
      if (res.error) throw new Error(res.error);
      return res.data ?? { items: [], total: 0, page: 1, page_size: 50, total_pages: 0 };
    },
  });
}
