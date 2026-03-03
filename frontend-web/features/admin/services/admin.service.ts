/**
 * Admin feature service. Society users list, create, and update.
 */
import { listUsers, createUser, updateUser } from "@/lib/api";
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

export async function updateUserEntity(
  userId: string,
  body: { roles?: string[]; full_name?: string; phone?: string; flat_number?: string }
): Promise<{ user: UserListItem | null; error?: string }> {
  return updateUser(userId, body);
}
