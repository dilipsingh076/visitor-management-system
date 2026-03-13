/**
 * Query keys for admin features (society admin + platform admin)
 */
export const adminKeys = {
  all: ["admin"] as const,
  dashboard: () => [...adminKeys.all, "dashboard"] as const,
  
  societies: () => [...adminKeys.all, "societies"] as const,
  societyList: (filters?: Record<string, unknown>) => [...adminKeys.societies(), "list", filters] as const,
  societyDetail: (id: string) => [...adminKeys.societies(), "detail", id] as const,
  
  // Society admin user management (compatible with existing useAdminUsers)
  users: (role?: string) => [...adminKeys.all, "users", role] as const,
  
  // Platform admin user list
  userList: (filters?: Record<string, unknown>) => [...adminKeys.all, "platform-users", "list", filters] as const,
  userDetail: (id: string) => [...adminKeys.all, "platform-users", "detail", id] as const,
  
  subscriptions: () => [...adminKeys.all, "subscriptions"] as const,
  plans: () => [...adminKeys.subscriptions(), "plans"] as const,
  subscriptionList: (filters?: Record<string, unknown>) => [...adminKeys.subscriptions(), "list", filters] as const,
  payments: (filters?: Record<string, unknown>) => [...adminKeys.subscriptions(), "payments", filters] as const,
  invoices: (filters?: Record<string, unknown>) => [...adminKeys.subscriptions(), "invoices", filters] as const,
  
  complaints: () => [...adminKeys.all, "complaints"] as const,
  complaintList: (filters?: Record<string, unknown>) => [...adminKeys.complaints(), "list", filters] as const,
  complaintDetail: (id: string) => [...adminKeys.complaints(), "detail", id] as const,
  complaintStats: () => [...adminKeys.complaints(), "stats"] as const,
  
  support: () => [...adminKeys.all, "support"] as const,
  ticketList: (filters?: Record<string, unknown>) => [...adminKeys.support(), "list", filters] as const,
  ticketDetail: (id: string) => [...adminKeys.support(), "detail", id] as const,
  supportStats: () => [...adminKeys.support(), "stats"] as const,
  
  auditLogs: () => [...adminKeys.all, "audit-logs"] as const,
  auditLogList: (filters?: Record<string, unknown>) => [...adminKeys.auditLogs(), "list", filters] as const,
  
  settings: () => [...adminKeys.all, "settings"] as const,
  announcements: () => [...adminKeys.settings(), "announcements"] as const,
  systemSettings: (category?: string) => [...adminKeys.settings(), "system", category] as const,
};
