"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { checkInOtp, checkInQr } from "../services";

export function useCheckInOtp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkInOtp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guard"] });
      queryClient.invalidateQueries({ queryKey: ["visitors"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useCheckInQr() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkInQr,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guard"] });
      queryClient.invalidateQueries({ queryKey: ["visitors"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

