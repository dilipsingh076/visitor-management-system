"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSocieties, createSocietyEntity } from "../services";
import type { SocietyListItem } from "../types";
import { platformKeys } from "./keys";

export function useSocieties(enabled = true) {
  return useQuery({
    queryKey: platformKeys.societies(),
    queryFn: () => getSocieties(),
    enabled,
  });
}

export function useCreateSociety() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSocietyEntity,
    onSuccess: (data: SocietyListItem | null) => {
      if (data) queryClient.invalidateQueries({ queryKey: platformKeys.all });
    },
  });
}
