export interface MaintenanceStaff {
  id: string;
  society_id: string;
  full_name: string;
  role: string;
  phone: string | null;
  email: string | null;
  building_id: string | null;
  building_name: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceStaffCreateInput {
  full_name: string;
  role: string;
  phone?: string;
  email?: string;
  building_id?: string;
  notes?: string;
}

export interface MaintenanceStaffUpdateInput {
  full_name?: string;
  role?: string;
  phone?: string;
  email?: string;
  building_id?: string | null;
  notes?: string;
  is_active?: boolean;
}
