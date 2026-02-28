import { apiClient } from "@/lib/api";
import { downloadBlob } from "@/lib/api";
import { API } from "@/lib/api/endpoints";
import type { Visit, BlacklistEntry } from "@/types";

function normalizeVisit(raw: Record<string, unknown>): Visit {
  return {
    id: String(raw.id),
    visitor_id: String(raw.visitor_id),
    host_id: String(raw.host_id),
    host_name: raw.host_name != null ? String(raw.host_name) : undefined,
    status: (raw.status as Visit["status"]) || "pending",
    purpose: raw.purpose != null ? String(raw.purpose) : undefined,
    visitor_name: String(raw.visitor_name ?? ""),
    visitor_phone: String(raw.visitor_phone ?? ""),
    consent_given: Boolean(raw.consent_given),
    is_walkin: Boolean((raw.extra_data as Record<string, unknown>)?.walkin ?? raw.is_walkin),
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
  };
}

function normalizeBlacklist(raw: Record<string, unknown>): BlacklistEntry {
  return {
    visitor_id: String(raw.visitor_id ?? raw.id ?? ""),
    visitor_name: String(raw.visitor_name ?? ""),
    visitor_phone: String(raw.visitor_phone ?? ""),
    reason: String(raw.reason ?? ""),
    created_at: raw.created_at != null ? String(raw.created_at) : undefined,
  };
}

export async function getVisitsByStatus(status: string): Promise<Visit[]> {
  const res = await apiClient.get<unknown[]>(API.visitors.list + "?status=" + status);
  return Array.isArray(res.data) ? res.data.map((v) => normalizeVisit(v as Record<string, unknown>)) : [];
}

export async function getBlacklist(): Promise<BlacklistEntry[]> {
  const res = await apiClient.get<unknown[]>(API.blacklist.list);
  return Array.isArray(res.data) ? res.data.map((b) => normalizeBlacklist(b as Record<string, unknown>)) : [];
}

export async function checkout(visitId: string): Promise<void> {
  const res = await apiClient.post(API.checkin.checkout, { visit_id: visitId });
  if (res.error) throw new Error(res.error);
}

export interface BlacklistByPhonePayload {
  visitor_name: string;
  visitor_phone: string;
  reason: string;
}

export async function addToBlacklistByPhone(payload: BlacklistByPhonePayload): Promise<{ error?: string }> {
  const res = await apiClient.post(API.blacklist.addByPhone, {
    visitor_name: payload.visitor_name.trim(),
    visitor_phone: payload.visitor_phone.replace(/\D/g, "").slice(0, 10),
    reason: payload.reason.trim(),
  });
  return res.error ? { error: res.error } : {};
}

export async function addToBlacklistByVisitorId(visitorId: string, reason: string): Promise<void> {
  const res = await apiClient.post(API.blacklist.add, { visitor_id: visitorId, reason });
  if (res.error) throw new Error(res.error);
}

export async function removeFromBlacklist(visitorId: string): Promise<void> {
  const res = await apiClient.delete(API.blacklist.remove(visitorId));
  if (res.error) throw new Error(res.error);
}

export async function exportMuster(filename?: string): Promise<boolean> {
  const name = filename ?? "muster_" + new Date().toISOString().slice(0, 10) + ".csv";
  return downloadBlob("/dashboard/muster?format=csv", name);
}
