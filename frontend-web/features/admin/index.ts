/**
 * Admin feature exports - both society admin and platform admin
 */

// Types
export * from "./types";

// Constants
export * from "./constants";

// Society admin hooks (existing)
export * from "./hooks/useAdminUsers";
export * from "./hooks/useUserManagement";

// Platform admin hooks (new)
export * from "./hooks/usePlatformDashboard";
export * from "./hooks/usePlatformSocieties";
export * from "./hooks/usePlatformUsers";
export * from "./hooks/usePlatformSubscriptions";
export * from "./hooks/usePlatformComplaints";
export * from "./hooks/usePlatformSupport";
export * from "./hooks/usePlatformAuditLogs";
export * from "./hooks/usePlatformSettings";

// Role options for select dropdowns
export const ROLE_OPTIONS = [
  { value: "resident", label: "Resident" },
  { value: "guard", label: "Security Guard" },
  { value: "chairman", label: "Chairman" },
  { value: "secretary", label: "Secretary" },
  { value: "treasurer", label: "Treasurer" },
] as const;
