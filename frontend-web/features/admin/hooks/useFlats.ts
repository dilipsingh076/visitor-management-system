"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAvailableFlats, fetchFlats, createFlat, bulkCreateFlats, updateFlat, removeResidentFromFlat,
  fetchFlatMembers, addFlatMember, updateFlatMember, removeFlatMember,
  migrateFlats,
} from "../services/flats.service";

export const flatsKeys = {
  all: ["flats"] as const,
  list: (buildingId: string) => [...flatsKeys.all, "list", buildingId] as const,
  members: (flatId: string) => [...flatsKeys.all, "members", flatId] as const,
};

/** Public: fetch only vacant flats (no auth required, for signup). */
export function useAvailableFlats(buildingId: string | null | undefined) {
  return useQuery({
    queryKey: [...flatsKeys.all, "available", buildingId ?? ""],
    queryFn: () => fetchAvailableFlats(buildingId!),
    enabled: Boolean(buildingId),
  });
}

export function useFlats(buildingId: string | null | undefined) {
  return useQuery({
    queryKey: flatsKeys.list(buildingId ?? ""),
    queryFn: () => fetchFlats(buildingId!),
    enabled: Boolean(buildingId),
  });
}

export function useCreateFlat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createFlat,
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: flatsKeys.list(vars.building_id) });
    },
  });
}

export function useBulkCreateFlats() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bulkCreateFlats,
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: flatsKeys.list(vars.building_id) });
    },
  });
}

export function useUpdateFlat(buildingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { flatId: string; data: Parameters<typeof updateFlat>[1] }) =>
      updateFlat(args.flatId, args.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: flatsKeys.list(buildingId) });
    },
  });
}

export function useFlatMembers(flatId: string | null | undefined) {
  return useQuery({
    queryKey: flatsKeys.members(flatId ?? ""),
    queryFn: () => fetchFlatMembers(flatId!),
    enabled: Boolean(flatId),
  });
}

export function useAddFlatMember(flatId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof addFlatMember>[1]) => addFlatMember(flatId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: flatsKeys.members(flatId) });
    },
  });
}

export function useUpdateFlatMember(flatId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { memberId: string; data: Parameters<typeof updateFlatMember>[2] }) =>
      updateFlatMember(flatId, args.memberId, args.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: flatsKeys.members(flatId) });
    },
  });
}

export function useRemoveFlatMember(flatId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => removeFlatMember(flatId, memberId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: flatsKeys.members(flatId) });
    },
  });
}

export function useRemoveResidentFromFlat(buildingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (flatId: string) => removeResidentFromFlat(flatId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: flatsKeys.list(buildingId) });
    },
  });
}

export function useMigrateFlats() {
  return useMutation({ mutationFn: migrateFlats });
}
