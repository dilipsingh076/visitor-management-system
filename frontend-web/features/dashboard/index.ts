export type { DashboardStats, Visit, MyRequestsResponse, RecentActivityItem } from "./types";

export { dashboardKeys } from "./hooks/keys";
export { useDashboardStats, useDashboardMyRequests, useRecentVisits } from "./hooks/useDashboardData";

export { AdminDashboard } from "./components/AdminDashboard";
export { GuardDashboard } from "./components/GuardDashboard";
export { ResidentDashboard } from "./components/ResidentDashboard";

