/**
 * Common types shared across features (API shapes, enums).
 * Feature-specific types live in each feature folder (e.g. features/guard/types.ts).
 */
export type {
  Visit,
  VisitStatus,
  VisitInviteRequest,
  WalkInRequest,
  CheckInOtpRequest,
  CheckInQrRequest,
  CheckOutRequest,
  CheckInResponse,
  BlacklistEntry,
  BlacklistAddRequest,
  BlacklistByPhoneRequest,
  Notification,
  Resident,
  DashboardStats,
} from "@/lib/types";
