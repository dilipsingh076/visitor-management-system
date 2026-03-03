import type { UserListItem } from "@/lib/api";

/** Display shape for user management (society users). One user can have multiple roles. */
export interface UserData {
  id: string;
  email: string;
  username: string;
  role: string;
  roles: string[];
  flat_number?: string;
  phone?: string;
  status: "active" | "inactive";
  created_at: string;
  last_login?: string;
}

export function mapUserListItemToUserData(u: UserListItem): UserData {
  const roles = Array.isArray(u.roles) && u.roles.length > 0 ? u.roles : [u.role];
  return {
    id: u.id,
    email: u.email,
    username: u.full_name || u.username,
    role: roles[0] ?? u.role,
    roles,
    flat_number: u.flat_number ?? undefined,
    phone: u.phone ?? undefined,
    status: u.is_active ? "active" : "inactive",
    created_at: u.created_at ? u.created_at.split("T")[0] : "",
    last_login: u.last_login ? (u.last_login.split("T")[0] || "—") : undefined,
  };
}

export const ROLE_OPTIONS = [
  { value: "chairman", label: "Chairman" },
  { value: "secretary", label: "Secretary" },
  { value: "treasurer", label: "Treasurer" },
  { value: "guard", label: "Guard" },
  { value: "resident", label: "Resident" },
] as const;
