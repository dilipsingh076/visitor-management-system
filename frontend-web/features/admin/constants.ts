import type { UserData } from "./types";

/** Roles that are committee (Chairman, Secretary, Treasurer). */
export const COMMITTEE_ROLES = ["chairman", "secretary", "treasurer"] as const;

export type CommitteeRole = (typeof COMMITTEE_ROLES)[number];

/** Badge variant by role for UI. */
export const ROLE_BADGE_VARIANTS: Record<string, "success" | "warning" | "info" | "default"> = {
  chairman: "success",
  secretary: "success",
  treasurer: "success",
  guard: "warning",
  resident: "info",
};

/** Initial form state for Add User modal. */
export const INITIAL_NEW_USER_FORM = {
  email: "",
  username: "",
  role: "resident",
  flat_number: "",
  phone: "",
  password: "",
} as const;

export type NewUserFormState = {
  email: string;
  username: string;
  role: string;
  flat_number: string;
  phone: string;
  password: string;
};

export const DEFAULT_NEW_USER: NewUserFormState = {
  email: "",
  username: "",
  role: "resident",
  flat_number: "",
  phone: "",
  password: "",
};

/** Roles that should show flat/unit field in forms. */
export function shouldShowFlatForRole(role: string): boolean {
  return role === "resident" || COMMITTEE_ROLES.includes(role as CommitteeRole);
}
