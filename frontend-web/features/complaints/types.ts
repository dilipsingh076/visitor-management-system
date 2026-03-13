export interface Complaint {
  id: string;
  society_id: string | null;
  filed_by: string | null;
  assigned_to: string | null;
  title: string;
  description: string | null;
  category: string;
  priority: string;
  status: string;
  resolution_notes: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  escalated: boolean;
  escalated_at: string | null;
  escalation_reason: string | null;
  created_at: string;
  updated_at: string;
  society_name: string | null;
  filed_by_name: string | null;
  assigned_to_name: string | null;
}

export interface ComplaintListResponse {
  items: Complaint[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ComplaintStats {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  escalated: number;
  by_category: Record<string, number>;
  by_priority: Record<string, number>;
}

export interface ComplaintCreateInput {
  title: string;
  description: string;
  category: string;
  priority?: string;
}

export interface ComplaintUpdateInput {
  title?: string;
  description?: string;
  category?: string;
  priority?: string;
  status?: string;
  resolution_notes?: string;
  assigned_to?: string;
}

export interface ComplaintComment {
  id: string;
  complaint_id: string;
  user_id: string | null;
  user_name: string | null;
  comment: string;
  created_at: string;
}
