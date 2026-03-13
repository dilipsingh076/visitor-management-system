export interface Amenity {
  id: string;
  society_id: string;
  name: string;
  code: string | null;
  description: string | null;
  status: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AmenityCreateInput {
  name: string;
  code?: string;
  description?: string;
  status?: string;
  sort_order?: number;
}

export interface AmenityUpdateInput {
  name?: string;
  code?: string;
  description?: string;
  status?: string;
  sort_order?: number;
  is_active?: boolean;
}
