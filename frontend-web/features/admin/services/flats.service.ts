import { apiClient } from "@/lib/api";
import { API } from "@/lib/api/endpoints";
import type { Flat, FlatMember } from "@/lib/types";

// ──────────────── Flats ────────────────

/** Public: fetch vacant flats for signup page (no auth required). */
export async function fetchAvailableFlats(buildingId: string): Promise<{ id: string; flat_number: string; floor?: number | null; flat_type?: string | null }[]> {
  const res = await apiClient.get<{ id: string; flat_number: string; floor?: number | null; flat_type?: string | null }[]>(
    `/flats/available?building_id=${buildingId}`
  );
  if (res.error || !res.data) return [];
  return Array.isArray(res.data) ? res.data : [];
}

export async function fetchFlats(buildingId: string): Promise<Flat[]> {
  const res = await apiClient.get<Flat[]>(`${API.flats.list}?building_id=${buildingId}`);
  if (res.error || !res.data) return [];
  return Array.isArray(res.data) ? res.data : [];
}

export async function createFlat(data: {
  building_id: string;
  flat_number: string;
  floor?: number;
  flat_type?: string;
  owner_name?: string;
}): Promise<Flat | null> {
  const res = await apiClient.post<Flat>(API.flats.create, data);
  if (res.error) throw new Error(res.error);
  return res.data ?? null;
}

export async function bulkCreateFlats(data: {
  building_id: string;
  total_floors: number;
  units_per_floor: number;
  start_floor?: number;
  flat_type?: string;
}): Promise<{ created: number; skipped: number; flats: Flat[] }> {
  const res = await apiClient.post<{ created: number; skipped: number; flats: Flat[] }>(
    API.flats.bulkCreate,
    data
  );
  if (res.error) throw new Error(res.error);
  return res.data ?? { created: 0, skipped: 0, flats: [] };
}

export async function updateFlat(
  flatId: string,
  data: {
    flat_number?: string;
    floor?: number;
    flat_type?: string;
    occupancy_status?: string;
    owner_name?: string;
    is_active?: boolean;
  }
): Promise<Flat | null> {
  const res = await apiClient.patch<Flat>(API.flats.update(flatId), data);
  if (res.error) throw new Error(res.error);
  return res.data ?? null;
}

export async function removeResidentFromFlat(flatId: string): Promise<{ ok: boolean; removed_user: string }> {
  const res = await apiClient.post<{ ok: boolean; removed_user: string }>(`/flats/${flatId}/remove-resident`, {});
  if (res.error) throw new Error(res.error);
  return res.data ?? { ok: false, removed_user: "" };
}

export async function migrateFlats(): Promise<{ created_flats: number; updated_users: number }> {
  const res = await apiClient.post<{ created_flats: number; updated_users: number }>(API.flats.migrate, {});
  if (res.error) throw new Error(res.error);
  return res.data ?? { created_flats: 0, updated_users: 0 };
}

// ──────────────── Flat Members ────────────────

export async function fetchFlatMembers(flatId: string): Promise<FlatMember[]> {
  const res = await apiClient.get<FlatMember[]>(API.flats.members(flatId));
  if (res.error || !res.data) return [];
  return Array.isArray(res.data) ? res.data : [];
}

export async function addFlatMember(
  flatId: string,
  data: {
    full_name: string;
    phone?: string;
    relation: string;
    date_of_birth?: string;
    id_proof_type?: string;
    id_proof_number?: string;
  }
): Promise<FlatMember | null> {
  const res = await apiClient.post<FlatMember>(API.flats.members(flatId), data);
  if (res.error) throw new Error(res.error);
  return res.data ?? null;
}

export async function updateFlatMember(
  flatId: string,
  memberId: string,
  data: {
    full_name?: string;
    phone?: string;
    relation?: string;
    date_of_birth?: string;
    id_proof_type?: string;
    id_proof_number?: string;
  }
): Promise<FlatMember | null> {
  const res = await apiClient.patch<FlatMember>(API.flats.member(flatId, memberId), data);
  if (res.error) throw new Error(res.error);
  return res.data ?? null;
}

export async function removeFlatMember(flatId: string, memberId: string): Promise<void> {
  const res = await apiClient.delete(API.flats.member(flatId, memberId));
  if (res.error) throw new Error(res.error);
}
