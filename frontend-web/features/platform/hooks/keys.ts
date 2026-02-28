export const platformKeys = {
  all: ["platform"] as const,
  societies: (q?: string) => [...platformKeys.all, "societies", q ?? ""] as const,
};
