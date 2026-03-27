"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getActiveSos, resolveSos } from "./service";
import { sosKeys } from "./keys";

export function useActiveSos(enabled: boolean) {
  return useQuery({
    queryKey: sosKeys.active(),
    enabled,
    queryFn: getActiveSos,
    refetchInterval: 30_000,
  });
}

export function useResolveSos() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resolveSos(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sosKeys.active() });
    },
  });
}

