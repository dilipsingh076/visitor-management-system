"use client";

import { useSearchParams } from "next/navigation";
import { canInviteVisitor, getPrimaryRole, isSocietyAdmin } from "@/lib/auth";
import type { User } from "@/lib/auth";
import {
  useVisitorsList,
  useUnreadNotifications,
  useMarkNotificationRead,
  useApproveVisit,
} from "@/features/visitors";
import type { VisitorsStatusFilter, VisitorsScope } from "../types";
import { theme } from "@/lib/theme";

const ALLOWED_STATUSES = ["", "pending", "approved", "checked_in", "checked_out", "cancelled"] as const;

export interface VisitorsFilterOption {
  value: string;
  label: string;
  href: string;
  activeVariant?: keyof typeof theme.filterPill;
}

export function useVisitorsPage(user: User | null) {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") || "";

  const role = getPrimaryRole(user);
  const scope: VisitorsScope = role === "resident" ? "me" : "all";
  const status: VisitorsStatusFilter = ALLOWED_STATUSES.includes(statusFilter as (typeof ALLOWED_STATUSES)[number])
    ? (statusFilter as VisitorsStatusFilter)
    : "";

  const visitsQ = useVisitorsList({ status, scope, enabled: Boolean(user) });
  const notificationsQ = useUnreadNotifications(Boolean(user) && (role === "resident" || isSocietyAdmin(role)));
  const markReadMutation = useMarkNotificationRead();
  const approveMutation = useApproveVisit();

  const visits = visitsQ.data ?? [];
  const notifications = notificationsQ.data ?? [];
  const approvingId = approveMutation.isPending ? (approveMutation.variables as string) : null;
  const loading = visitsQ.isLoading || notificationsQ.isLoading;

  const filterOptions: VisitorsFilterOption[] = [
    { value: "", label: "All", href: "/visitors" },
    { value: "pending", label: "Pending", href: "/visitors?status=pending", activeVariant: "pending" },
    { value: "approved", label: "Approved", href: "/visitors?status=approved", activeVariant: "approved" },
    { value: "checked_in", label: "Checked in", href: "/visitors?status=checked_in", activeVariant: "checked_in" },
  ];

  return {
    scope,
    status,
    visits,
    notifications,
    loading,
    filterOptions,
    currentFilter: statusFilter,
    canInvite: user ? canInviteVisitor(user) : false,
    markRead: markReadMutation.mutate,
    dismissingNotificationId: markReadMutation.isPending ? (markReadMutation.variables as string) : null,
    approve: approveMutation.mutate,
    approveMutation,
    approvingId,
  };
}
