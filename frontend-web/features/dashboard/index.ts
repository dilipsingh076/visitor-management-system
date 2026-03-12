export type { DashboardStats, Visit, MyRequestsResponse, RecentActivityItem } from "./types";

export { dashboardKeys } from "./hooks/keys";
export { useDashboardStats, useDashboardMyRequests, useRecentVisits } from "./hooks/useDashboardData";

export { ChairmanDashboard } from "./components/ChairmanDashboard";
export { SecretaryDashboard } from "./components/SecretaryDashboard";
export { TreasurerDashboard } from "./components/TreasurerDashboard";
export { GuardDashboard } from "./components/GuardDashboard";
export { ResidentDashboard } from "./components/ResidentDashboard";

