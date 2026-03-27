export const sosKeys = {
  all: ["sos"] as const,
  active: () => [...sosKeys.all, "active"] as const,
};

