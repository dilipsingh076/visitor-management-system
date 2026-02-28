/**
 * Guard feature types. Visit and BlacklistEntry come from common types.
 */
import type { Visit, BlacklistEntry } from "@/types";

export type { Visit, BlacklistEntry };

export type GuardSectionVariant = "warning" | "success" | "primary" | "default";

export interface GuardTableColumn<T = Visit> {
  key: keyof Visit | "actions";
  label: string;
  render?: (row: T) => React.ReactNode;
}

export interface GuardActionConfig {
  label: string;
  onClick: (visit: Visit) => void;
  loadingId?: string | null;
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

export interface GuardSecondaryActionConfig {
  label: string;
  onClick: (visit: Visit) => void;
  loadingId?: string | null;
  disabled?: boolean;
  className?: string;
}
