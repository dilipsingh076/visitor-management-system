"use client";

import { useQuery } from "@tanstack/react-query";
import { getVisitorsList } from "../services";
import type { VisitorsScope, VisitorsStatusFilter } from "../types";
import { visitorsKeys } from "./keys";

export function useVisitorsList(params: {
  status: VisitorsStatusFilter;
  scope: VisitorsScope;
  enabled?: boolean;
}) {
  const { status, scope, enabled = true } = params;
  return useQuery({
    queryKey: visitorsKeys.list({ status, scope }),
    enabled,
    queryFn: () => getVisitorsList({ status, scope }),
  });
}

