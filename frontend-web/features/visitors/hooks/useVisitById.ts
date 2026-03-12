"use client";

import { useQuery } from "@tanstack/react-query";
import { getVisitById } from "../services";
import { visitorsKeys } from "./keys";

export function useVisitById(visitId: string | null | undefined, enabled = true) {
  return useQuery({
    queryKey: [...visitorsKeys.all, "byId", visitId ?? null] as const,
    enabled: enabled && Boolean(visitId),
    queryFn: async () => {
      if (!visitId) return null;
      return await getVisitById(visitId);
    },
  });
}

