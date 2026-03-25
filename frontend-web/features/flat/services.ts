import { apiClient } from "@/lib/api";
import { API } from "@/lib/api/endpoints";
import type { MaintenanceBill, MaintenanceSummary, ResidentComplaint } from "@/lib/types";

// ──────────────── Maintenance ────────────────

export async function fetchMyBills(): Promise<MaintenanceBill[]> {
  const res = await apiClient.get<MaintenanceBill[]>(API.maintenance.myBills);
  if (res.error || !res.data) return [];
  return Array.isArray(res.data) ? res.data : [];
}

export async function fetchMySummary(): Promise<MaintenanceSummary> {
  const res = await apiClient.get<MaintenanceSummary>(API.maintenance.mySummary);
  return res.data ?? { total_due: 0, total_paid: 0, pending_count: 0, overdue_count: 0 };
}

// ──────────────── Complaints ────────────────

export async function fetchMyComplaints(status?: string): Promise<ResidentComplaint[]> {
  const url = status ? `${API.residentComplaints.my}?status=${status}` : API.residentComplaints.my;
  const res = await apiClient.get<ResidentComplaint[]>(url);
  if (res.error || !res.data) return [];
  return Array.isArray(res.data) ? res.data : [];
}

export async function createComplaint(data: {
  title: string;
  description: string;
  category: string;
  priority?: string;
}): Promise<ResidentComplaint | null> {
  const res = await apiClient.post<ResidentComplaint>(API.residentComplaints.create, data);
  if (res.error) throw new Error(res.error);
  return res.data ?? null;
}

export async function fetchComplaintComments(complaintId: string) {
  const res = await apiClient.get<{ id: string; user_name: string; comment: string; created_at: string }[]>(
    API.residentComplaints.comments(complaintId)
  );
  if (res.error || !res.data) return [];
  return Array.isArray(res.data) ? res.data : [];
}

export async function addComplaintComment(complaintId: string, comment: string) {
  const res = await apiClient.post(API.residentComplaints.comments(complaintId), { comment });
  if (res.error) throw new Error(res.error);
  return res.data;
}
