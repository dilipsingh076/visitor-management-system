/**
 * Platform (super admin) feature service. Societies list and create.
 */
import { listSocieties, createSociety } from "@/lib/api";
import type { SocietyListItem } from "@/lib/api";

export async function getSocieties(q?: string): Promise<SocietyListItem[]> {
  return listSocieties(q);
}

export async function createSocietyEntity(body: {
  name: string;
  slug: string;
  contact_email: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  contact_phone?: string;
  plan?: string;
  status?: string;
}): Promise<SocietyListItem | null> {
  return createSociety(body);
}
