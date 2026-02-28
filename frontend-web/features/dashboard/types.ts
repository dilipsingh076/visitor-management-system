import type { DashboardStats, Visit } from "@/types";

export type { DashboardStats, Visit };

export type PendingApprovalVisit = Pick<
  Visit,
  "id" | "visitor_name" | "visitor_phone" | "purpose" | "is_walkin" | "created_at"
>;

export interface MyRequestsResponse {
  count: number;
  visits: PendingApprovalVisit[];
}

export interface RecentActivityItem {
  id: string;
  visitor_name: string;
  action: string;
  timestamp: string;
  performed_by?: string;
}

