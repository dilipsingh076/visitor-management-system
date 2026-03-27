import { apiClient } from "@/lib/api";

export type SosType = "medical" | "fire" | "theft" | "lift" | "other";

export interface SosCreatePayload {
  type: SosType;
  note?: string;
}

export interface SosResponse {
  id: string;
  society_id: string;
  raised_by_user_id: string;
  raised_by_name?: string | null;
  type: string;
  note?: string | null;
  status: string;
  created_at: string;
}

export async function createSos(payload: SosCreatePayload): Promise<SosResponse> {
  const res = await apiClient.post<SosResponse>("/sos/", payload);
  if (res.error || !res.data) throw new Error(res.error || "Failed to send SOS");
  return res.data;
}

export async function getActiveSos(): Promise<SosResponse | null> {
  const res = await apiClient.get<SosResponse | null>("/sos/active");
  if (res.error) throw new Error(res.error || "Failed to fetch active SOS");
  return res.data ?? null;
}

export async function resolveSos(id: string): Promise<SosResponse> {
  const res = await apiClient.patch<SosResponse>(`/sos/${encodeURIComponent(id)}/resolve`, {});
  if (res.error || !res.data) throw new Error(res.error || "Failed to resolve SOS");
  return res.data;
}

