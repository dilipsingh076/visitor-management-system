"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchMyBills, fetchMySummary,
  fetchMyComplaints, createComplaint,
} from "./services";

export const maintenanceKeys = {
  bills: ["maintenance", "my-bills"] as const,
  summary: ["maintenance", "my-summary"] as const,
};

export const complaintKeys = {
  my: (status?: string) => ["complaints", "my", status ?? "all"] as const,
};

export function useMyBills() {
  return useQuery({
    queryKey: maintenanceKeys.bills,
    queryFn: fetchMyBills,
  });
}

export function useMySummary() {
  return useQuery({
    queryKey: maintenanceKeys.summary,
    queryFn: fetchMySummary,
  });
}

export function useMyComplaints(status?: string) {
  return useQuery({
    queryKey: complaintKeys.my(status),
    queryFn: () => fetchMyComplaints(status),
  });
}

export function useCreateComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createComplaint,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["complaints"] });
    },
  });
}
