/**
 * Visitors feature service. Wraps API calls and normalizes responses.
 * Hooks use this service instead of calling lib/api directly.
 */
import { apiClient } from "@/lib/api";
import { API } from "@/lib/api/endpoints";
import type { Visit } from "@/types";
import type { VisitorsScope, VisitorsStatusFilter } from "../types";

function normalizeVisit(raw: Record<string, unknown>): Visit {
  return {
    id: String(raw.id ?? ""),
    visitor_id: String(raw.visitor_id ?? ""),
    host_id: String(raw.host_id ?? ""),
    host_name: raw.host_name != null ? String(raw.host_name) : undefined,
    status: (raw.status as Visit["status"]) || "pending",
    purpose: raw.purpose != null ? String(raw.purpose) : undefined,
    visitor_name: String(raw.visitor_name ?? ""),
    visitor_phone: String(raw.visitor_phone ?? ""),
    expected_arrival: raw.expected_arrival != null ? String(raw.expected_arrival) : null,
    actual_arrival: raw.actual_arrival != null ? String(raw.actual_arrival) : null,
    actual_departure: raw.actual_departure != null ? String(raw.actual_departure) : null,
    qr_code: raw.qr_code != null ? String(raw.qr_code) : null,
    otp: raw.otp != null ? String(raw.otp) : null,
    consent_given: Boolean(raw.consent_given),
    is_walkin: Boolean((raw.extra_data as Record<string, unknown>)?.walkin ?? raw.is_walkin),
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
  };
}

export interface GetVisitorsListParams {
  status: VisitorsStatusFilter;
  scope: VisitorsScope;
}

export async function getVisitorsList(params: GetVisitorsListParams): Promise<Visit[]> {
  const { status, scope } = params;
  const qs = new URLSearchParams();
  if (status) qs.set("status", status);
  if (scope === "me") qs.set("host_id", "me");
  const url = `${API.visitors.list}${qs.toString() ? `?${qs.toString()}` : ""}`;
  const res = await apiClient.get<unknown[]>(url);
  return Array.isArray(res.data)
    ? res.data.map((v) => normalizeVisit(v as Record<string, unknown>))
    : [];
}

export async function approveVisit(visitId: string): Promise<void> {
  const res = await apiClient.patch(API.visitors.approve(visitId));
  if (res.error) throw new Error(res.error);
}

export async function rejectVisit(visitId: string): Promise<void> {
  const res = await apiClient.patch(API.visitors.reject(visitId));
  if (res.error) throw new Error(res.error);
}

export interface InviteVisitorPayload {
  visitor_name: string;
  visitor_phone: string;
  purpose?: string;
  expected_arrival?: string;
  building_id?: string;
}

export async function inviteVisitor(
  payload: InviteVisitorPayload
): Promise<{ visit_id: string; otp?: string; message?: string; qr_code?: string }> {
  const res = await apiClient.post<{ visit_id: string; otp?: string; message?: string; qr_code?: string }>(
    API.visitors.invite,
    {
      visitor_name: payload.visitor_name.trim(),
      visitor_phone: payload.visitor_phone.replace(/\D/g, "").slice(0, 10),
      purpose: payload.purpose?.trim() || undefined,
      expected_arrival: payload.expected_arrival,
      building_id: payload.building_id || undefined,
    }
  );
  if (res.error || !res.data) throw new Error(res.error || "Invite failed");
  return res.data;
}
