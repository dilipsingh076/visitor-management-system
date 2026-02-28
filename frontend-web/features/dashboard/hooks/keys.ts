export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: () => [...dashboardKeys.all, "stats"] as const,
  myRequests: () => [...dashboardKeys.all, "myRequests"] as const,
  recentVisits: (limit: number) =>
    [...dashboardKeys.all, "recentVisits", limit] as const,
};

