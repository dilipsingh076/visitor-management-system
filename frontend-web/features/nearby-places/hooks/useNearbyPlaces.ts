"use client";

import { useQuery } from "@tanstack/react-query";
import { getNearbyPlaces, getPlaceCategories } from "../services";

export const nearbyPlacesKeys = {
  all: ["nearby-places"] as const,
  list: (lat: number, lng: number, category?: string, radius?: number) =>
    [...nearbyPlacesKeys.all, "list", lat, lng, category ?? "all", radius ?? 3000] as const,
  categories: () => [...nearbyPlacesKeys.all, "categories"] as const,
};

export function useNearbyPlaces(lat: number | null, lng: number | null, category?: string, radius?: number) {
  return useQuery({
    queryKey: nearbyPlacesKeys.list(lat ?? 0, lng ?? 0, category, radius),
    queryFn: () => getNearbyPlaces({ lat: lat!, lng: lng!, category, radius }),
    enabled: lat != null && lng != null,
  });
}

export function usePlaceCategories() {
  return useQuery({
    queryKey: nearbyPlacesKeys.categories(),
    queryFn: getPlaceCategories,
  });
}
