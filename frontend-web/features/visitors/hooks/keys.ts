import type { VisitorsScope, VisitorsStatusFilter } from "../types";

export const visitorsKeys = {
  all: ["visitors"] as const,
  list: (params: { status: VisitorsStatusFilter; scope: VisitorsScope }) =>
    [...visitorsKeys.all, "list", params] as const,
  frequent: () => [...visitorsKeys.all, "frequent"] as const,
};

export const notificationsKeys = {
  all: ["notifications"] as const,
  unread: () => [...notificationsKeys.all, "unread"] as const,
};

export const buildingsKeys = {
  all: ["buildings"] as const,
  listBySociety: (societyId: string | null | undefined) =>
    [...buildingsKeys.all, "bySociety", societyId ?? null] as const,
};

