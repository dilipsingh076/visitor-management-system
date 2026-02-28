"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Notification } from "@/types";
import { getUnreadNotifications, markNotificationRead } from "../services";
import { notificationsKeys } from "./keys";

export function useUnreadNotifications(enabled: boolean) {
  return useQuery({
    queryKey: notificationsKeys.unread(),
    enabled,
    queryFn: getUnreadNotifications,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await markNotificationRead(id);
      return true;
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: notificationsKeys.unread() });
      const prev =
        queryClient.getQueryData<Notification[]>(notificationsKeys.unread()) ??
        [];
      queryClient.setQueryData<Notification[]>(
        notificationsKeys.unread(),
        prev.filter((n) => n.id !== id)
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(notificationsKeys.unread(), ctx.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.unread() });
    },
  });
}

