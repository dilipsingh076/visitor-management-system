/**
 * Admin feature service. Society users list and create.
 */
import { listUsers, createUser } from "@/lib/api";
import type { UserListItem } from "@/lib/api";

export async function getUsers(role?: string): Promise<UserListItem[]> {
  return listUsers(role);
}

export async function createUserEntity(body: {
  email: string;
  full_name: string;
  role: string;
  password: string;
  phone?: string;
  flat_number?: string;
}): Promise<{ user: UserListItem | null; error?: string }> {
  return createUser(body);
}
