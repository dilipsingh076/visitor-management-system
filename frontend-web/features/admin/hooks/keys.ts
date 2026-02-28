export const adminKeys = {
  all: ["admin"] as const,
  users: (role?: string) => [...adminKeys.all, "users", role ?? "all"] as const,
};
