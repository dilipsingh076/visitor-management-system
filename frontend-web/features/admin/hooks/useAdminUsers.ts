"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, createUserEntity } from "../services";
import { mapUserListItemToUserData } from "../types";
import { adminKeys } from "./keys";

export function useAdminUsers(role?: string, enabled = true) {
  return useQuery({
    queryKey: adminKeys.users(role),
    queryFn: async () => {
      const list = await getUsers(role);
      return list.map(mapUserListItemToUserData);
    },
    enabled,
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUserEntity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}
