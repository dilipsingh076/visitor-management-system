"use client";

import { useQuery } from "@tanstack/react-query";
import { listBuildings, type BuildingListItem } from "@/lib/api";
import { buildingsKeys } from "./keys";

export function useBuildings(societyId: string | null | undefined) {
  return useQuery({
    queryKey: buildingsKeys.listBySociety(societyId),
    enabled: Boolean(societyId),
    queryFn: async (): Promise<BuildingListItem[]> => {
      if (!societyId) return [];
      return listBuildings(societyId);
    },
  });
}

