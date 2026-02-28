"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inviteVisitor } from "../services";
import { visitorsKeys } from "./keys";

export function useInviteVisitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inviteVisitor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: visitorsKeys.all });
    },
  });
}

