/**
 * API types - from docs/API_SCHEMA.md
 */

export type VisitStatus =
  | "pending"
  | "approved"
  | "checked_in"
  | "checked_out"
  | "cancelled";

export interface Visit {
  id: string;
  visitor_id: string;
  host_id: string;
  host_name?: string;
  status: VisitStatus;
  purpose?: string;
  visitor_name: string;
  visitor_phone: string;
  building_name?: string | null;
  host_flat_number?: string | null;
  expected_arrival?: string | null;
  actual_arrival?: string | null;
  actual_departure?: string | null;
  qr_code?: string | null;
  otp?: string | null;
  consent_given: boolean;
  is_walkin?: boolean;
  created_at: string;
  updated_at: string;
}

export interface VisitInviteRequest {
  visitor_name: string;
  visitor_phone: string;
  purpose?: string;
  visitor_email?: string;
  expected_arrival?: string;
}

export interface WalkInRequest {
  visitor_name: string;
  visitor_phone: string;
  purpose?: string;
  host_id: string;
}

export interface CheckInOtpRequest {
  otp: string;
  consent_given: boolean;
}

export interface CheckInQrRequest {
  qr_code: string;
  consent_given: boolean;
}

export interface CheckOutRequest {
  visit_id: string;
}

export interface CheckInResponse {
  visit_id: string;
  status: string;
  checkin_time: string;
  photo_url?: string | null;
  message: string;
}

export interface BlacklistEntry {
  id?: string;
  visitor_id: string;
  visitor_name: string;
  visitor_phone: string;
  reason: string;
  created_at?: string;
}

export interface BlacklistAddRequest {
  visitor_id: string;
  reason: string;
}

export interface BlacklistByPhoneRequest {
  visitor_phone: string;
  visitor_name: string;
  reason: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  extra_data?: string | null;
  created_at: string;
}

export interface Resident {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  flat_no?: string;
  flat_id?: string | null;
  building_id?: string | null;
  building_name?: string | null;
}

export interface Flat {
  id: string;
  building_id: string;
  flat_number: string;
  floor?: number | null;
  flat_type?: string | null;
  occupancy_status: string;
  owner_name?: string | null;
  registered_owner?: string | null;
  is_active: boolean;
  resident_count: number;
  created_at: string;
}

export interface FlatMember {
  id: string;
  flat_id: string;
  full_name: string;
  phone?: string | null;
  relation: string;
  date_of_birth?: string | null;
  photo_url?: string | null;
  id_proof_type?: string | null;
  id_proof_number?: string | null;
  is_active: boolean;
}

export interface MaintenanceBill {
  id: string;
  society_id: string;
  flat_id: string;
  flat_number: string | null;
  amount: number;
  due_date: string;
  period: string;
  description: string | null;
  status: string; // pending, paid, overdue
  paid_date: string | null;
  payment_method: string | null;
  payment_reference: string | null;
  created_at: string;
}

export interface MaintenanceSummary {
  total_due: number;
  total_paid: number;
  pending_count: number;
  overdue_count: number;
}

export interface ResidentComplaint {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  resolution_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  visitors_today: number;
  pending_approvals: number;
  checked_in: number;
}
