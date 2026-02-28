/**
 * Auth feature types. User shape is also in lib/auth for API usage.
 */
export interface SocietySummary {
  id: string;
  slug: string;
  name: string;
}

export interface User {
  id: string;
  user_id?: string;
  email: string;
  roles: string[];
  role?: string;
  username: string;
  society_id?: string;
  building_id?: string;
  society?: SocietySummary;
}

export type RoleLabelKey = "admin" | "guard" | "resident" | "super_admin";
