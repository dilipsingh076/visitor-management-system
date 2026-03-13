/**
 * Admin feature types - both society admin and platform admin
 */

import type { UserListItem } from "@/lib/api";

// Society Admin Types
export interface UserData {
  id: string;
  email: string;
  username: string;
  role: string;
  roles: string[];
  phone?: string;
  flat_number?: string;
  status: "active" | "inactive";
  created_at?: string;
  last_login?: string;
}

export function mapUserListItemToUserData(item: UserListItem): UserData {
  return {
    id: item.id,
    email: item.email,
    username: item.full_name,
    role: item.role,
    roles: item.roles ?? [item.role],
    phone: item.phone ?? undefined,
    flat_number: item.flat_number ?? undefined,
    status: item.is_active ? "active" : "inactive",
    created_at: item.created_at ?? undefined,
    last_login: item.last_login ?? undefined,
  };
}

// Platform Admin Types
// Dashboard
export interface PlatformDashboardStats {
  total_societies: number;
  active_societies: number;
  total_residents: number;
  total_visitors_today: number;
  total_visitors_month: number;
  total_complaints: number;
  open_complaints: number;
  total_support_tickets: number;
  open_support_tickets: number;
  total_revenue: number;
  revenue_this_month: number;
  active_subscriptions: number;
}

export interface SocietyGrowthData {
  date: string;
  count: number;
}

export interface RevenueData {
  date: string;
  amount: number;
}

export interface ActivityFeedItem {
  id: string;
  activity_type: string;
  description: string;
  user_name: string | null;
  society_name: string | null;
  created_at: string;
}

export interface PlatformDashboardResponse {
  stats: PlatformDashboardStats;
  society_growth: SocietyGrowthData[];
  revenue_trend: RevenueData[];
  recent_activity: ActivityFeedItem[];
  top_societies: { id: string; name: string; visit_count: number }[];
  complaint_breakdown: Record<string, number>;
}

// Societies
export interface PlatformSociety {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string | null;
  contact_email: string;
  contact_phone: string | null;
  registration_number: string | null;
  society_type: string | null;
  plan: string | null;
  status: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  total_buildings: number;
  total_residents: number;
  total_visitors_today?: number;
  total_visitors_month?: number;
}

export interface PlatformSocietyListResponse {
  items: PlatformSociety[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Users
export interface PlatformUser {
  id: string;
  email: string;
  phone: string | null;
  full_name: string;
  flat_number: string | null;
  is_active: boolean;
  is_verified: boolean;
  role: string;
  roles: string[] | null;
  society_id: string | null;
  building_id: string | null;
  last_login: string | null;
  created_at: string;
  society_name: string | null;
  building_name: string | null;
}

export interface PlatformUserListResponse {
  items: PlatformUser[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Subscriptions
export interface SubscriptionPlan {
  id: string;
  name: string;
  code: string;
  description: string | null;
  price: number;
  interval: string;
  max_residents: number | null;
  max_visitors_per_month: number | null;
  features: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  society_id: string;
  plan_id: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  trial_ends_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
  society_name?: string;
  plan_name?: string;
}

export interface Payment {
  id: string;
  subscription_id: string | null;
  society_id: string | null;
  amount: number;
  currency: string;
  status: string;
  payment_method: string | null;
  transaction_id: string | null;
  paid_at: string | null;
  refunded_at: string | null;
  created_at: string;
  society_name?: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  society_id: string | null;
  payment_id: string | null;
  amount: number;
  tax_amount: number | null;
  total_amount: number;
  currency: string;
  status: string;
  billing_name: string | null;
  billing_email: string | null;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
}

// Complaints
export interface Complaint {
  id: string;
  society_id: string;
  filed_by: string | null;
  assigned_to: string | null;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  resolution_notes: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  escalated: boolean;
  escalated_at: string | null;
  escalation_reason: string | null;
  created_at: string;
  updated_at: string;
  society_name: string | null;
  filed_by_name: string | null;
  assigned_to_name: string | null;
}

export interface ComplaintListResponse {
  items: Complaint[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ComplaintStats {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  escalated: number;
  by_category: Record<string, number>;
  by_priority: Record<string, number>;
}

// Support
export interface TicketMessage {
  id: string;
  ticket_id: string;
  user_id: string | null;
  message: string;
  is_staff_reply: boolean;
  attachments: string | null;
  created_at: string;
  user_name: string | null;
}

export interface SupportTicket {
  id: string;
  ticket_number: string;
  society_id: string | null;
  user_id: string | null;
  assigned_to: string | null;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_notes: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
  updated_at: string;
  society_name: string | null;
  user_name: string | null;
  assigned_to_name: string | null;
  messages?: TicketMessage[];
}

export interface SupportTicketListResponse {
  items: SupportTicket[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface SupportStats {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  by_category: Record<string, number>;
  by_priority: Record<string, number>;
  avg_resolution_time_hours: number | null;
}

// Audit Logs
export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  endpoint: string;
  request_method: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  user_name: string | null;
  user_email: string | null;
}

export interface AuditLogListResponse {
  items: AuditLog[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Announcements
export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  target_audience: string;
  target_society_id: string | null;
  is_active: boolean;
  show_from: string | null;
  show_until: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  target_society_name: string | null;
}

// System Settings
export interface SystemSetting {
  id: string;
  key: string;
  value: string | null;
  value_type: string;
  category: string | null;
  description: string | null;
  is_public: boolean;
  updated_at: string;
}
