import type { Visit, Notification, VisitStatus } from "@/types";
import type { BuildingListItem } from "@/lib/api";

export type { Visit, Notification, VisitStatus, BuildingListItem };

export type VisitorsScope = "all" | "me";

export type VisitorsStatusFilter = VisitStatus | "";

export type InviteVisitorResult = { visit_id: string; otp?: string; message?: string; qr_code?: string };

export interface FrequentVisitor {
  id: string;
  name: string;
  phone: string;
  purpose: string;
  visit_count: number;
  last_visit?: string;
}

