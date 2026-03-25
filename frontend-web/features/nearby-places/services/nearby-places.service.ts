import { apiClient } from "@/lib/api";
import { API } from "@/lib/api/endpoints";
import type { NearbyPlacesResponse, PlaceCategory } from "../types";

export async function getNearbyPlaces(params: {
  lat: number;
  lng: number;
  category?: string;
  radius?: number;
}): Promise<NearbyPlacesResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set("lat", String(params.lat));
  searchParams.set("lng", String(params.lng));
  if (params.category) searchParams.set("category", params.category);
  if (params.radius) searchParams.set("radius", String(params.radius));
  const url = `${API.nearbyPlaces.list}?${searchParams.toString()}`;
  const res = await apiClient.get<NearbyPlacesResponse>(url);
  if (res.error) throw new Error(res.error);
  return res.data ?? { places: [], center: { lat: 0, lng: 0 }, radius: 3000 };
}

export async function getPlaceCategories(): Promise<PlaceCategory[]> {
  const res = await apiClient.get<PlaceCategory[]>(API.nearbyPlaces.categories);
  return Array.isArray(res.data) ? res.data : [];
}
