"use client";

import { theme } from "@/lib/theme";

type StatusKey = keyof typeof theme.statusBadge;

export interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className = "" }: StatusBadgeProps) {
  const key = (theme.statusBadge as Record<string, string>)[status] ? (status as StatusKey) : "default";
  const classes = theme.statusBadge[key] ?? theme.statusBadge.default;
  const text = label ?? status.replace(/_/g, " ");
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${classes} ${className}`.trim()}>
      {text}
    </span>
  );
}
