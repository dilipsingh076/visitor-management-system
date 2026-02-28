"use client";

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getVisitsByStatus,
  getBlacklist,
  checkout as checkoutVisit,
  addToBlacklistByPhone,
  addToBlacklistByVisitorId,
  removeFromBlacklist,
  exportMuster as exportMusterBlob,
} from "../services";
import { GUARD_POLL_INTERVAL_MS } from "@/lib/constants";

export const guardKeys = {
  all: ["guard"] as const,
  pending: () => [...guardKeys.all, "pending"] as const,
  approved: () => [...guardKeys.all, "approved"] as const,
  checkedIn: () => [...guardKeys.all, "checkedIn"] as const,
  blacklist: () => [...guardKeys.all, "blacklist"] as const,
};

export function useGuardPending() {
  return useQuery({
    queryKey: guardKeys.pending(),
    queryFn: () => getVisitsByStatus("pending"),
    refetchInterval: GUARD_POLL_INTERVAL_MS,
  });
}

export function useGuardApproved() {
  return useQuery({
    queryKey: guardKeys.approved(),
    queryFn: () => getVisitsByStatus("approved"),
    refetchInterval: GUARD_POLL_INTERVAL_MS,
  });
}

export function useGuardCheckedIn() {
  return useQuery({
    queryKey: guardKeys.checkedIn(),
    queryFn: () => getVisitsByStatus("checked_in"),
    refetchInterval: GUARD_POLL_INTERVAL_MS,
  });
}

export function useGuardBlacklist() {
  return useQuery({
    queryKey: guardKeys.blacklist(),
    queryFn: getBlacklist,
    refetchInterval: GUARD_POLL_INTERVAL_MS,
  });
}

export function useGuardCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkoutVisit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guardKeys.all });
    },
  });
}

export function useGuardBlacklistByPhone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addToBlacklistByPhone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guardKeys.blacklist() });
    },
  });
}

export function useGuardBlacklistByVisitorId() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ visitorId, reason }: { visitorId: string; reason: string }) =>
      addToBlacklistByVisitorId(visitorId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guardKeys.all });
    },
  });
}

export function useGuardRemoveBlacklist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeFromBlacklist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guardKeys.blacklist() });
    },
  });
}

export function useGuardExportMuster() {
  return useCallback((filename?: string) => exportMusterBlob(filename), []);
}
