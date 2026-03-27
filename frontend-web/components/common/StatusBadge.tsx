"use client";

import { theme } from "@/lib/theme";

type StatusKey = keyof typeof theme.statusBadge;

const dotColors: Record<string, string> = {
  pending: "bg-warning",
  approved: "bg-info",
  checked_in: "bg-success",
  checked_out: "bg-muted-foreground",
  cancelled: "bg-error",
  default: "bg-muted-foreground",
};

export interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({ status, label, className = "", showDot = true }: StatusBadgeProps) {
  const key = (theme.statusBadge as Record<string, string>)[status] ? (status as StatusKey) : "default";
  const classes = theme.statusBadge[key] ?? theme.statusBadge.default;
  const dot = dotColors[status] ?? dotColors.default;
  const text = label ?? status.replace(/_/g, " ");
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${classes} ${className}`.trim()}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dot} ${status === "checked_in" ? "animate-pulse" : ""}`} />}
      {text}
    </span>
  );
}
