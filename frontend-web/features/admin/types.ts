import type { UserListItem } from "@/lib/api";

/** Display shape for user management (society users). */
export interface UserData {
  id: string;
  email: string;
  username: string;
  role: string;
  flat_number?: string;
  phone?: string;
  status: "active" | "inactive";
  created_at: string;
  last_login?: string;
}

export function mapUserListItemToUserData(u: UserListItem): UserData {
  return {
    id: u.id,
    email: u.email,
    username: u.full_name || u.username,
    role: u.role,
    flat_number: u.flat_number ?? undefined,
    phone: u.phone ?? undefined,
    status: u.is_active ? "active" : "inactive",
    created_at: u.created_at ? u.created_at.split("T")[0] : "",
    last_login: u.last_login ? (u.last_login.split("T")[0] || "—") : undefined,
  };
}

export const ROLE_OPTIONS = [
  { value: "resident", label: "Resident" },
  { value: "guard", label: "Guard" },
  { value: "admin", label: "Admin" },
] as const;
