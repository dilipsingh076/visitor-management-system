"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approveVisit, rejectVisit } from "../services";
import { visitorsKeys } from "./keys";

export function useApproveVisit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (visitId: string) => {
      await approveVisit(visitId);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: visitorsKeys.all });
      queryClient.invalidateQueries({ queryKey: ["guard"] });
    },
  });
}

export function useRejectVisit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (visitId: string) => {
      await rejectVisit(visitId);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: visitorsKeys.all });
      queryClient.invalidateQueries({ queryKey: ["guard"] });
    },
  });
}

