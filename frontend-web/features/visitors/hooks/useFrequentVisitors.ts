"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { API } from "@/lib/api/endpoints";
import type { Visit } from "@/types";
import type { FrequentVisitor } from "../types";
import { deriveFrequentVisitors } from "../utils/deriveFrequentVisitors";
import { visitorsKeys } from "./keys";

export function useFrequentVisitors(enabled: boolean) {
  return useQuery({
    queryKey: visitorsKeys.frequent(),
    enabled,
    queryFn: async (): Promise<FrequentVisitor[]> => {
      const res = await apiClient.get<
        Array<
          Pick<
            Visit,
            | "visitor_id"
            | "visitor_name"
            | "visitor_phone"
            | "purpose"
            | "created_at"
          >
        >
      >(`${API.visitors.list}?host_id=me&limit=100`);

      const rows = Array.isArray(res.data) ? res.data : [];
      return deriveFrequentVisitors(rows);
    },
  });
}

