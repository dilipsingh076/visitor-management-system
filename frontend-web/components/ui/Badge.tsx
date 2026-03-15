"use client";

import type { ReactNode } from "react";
import { ROLE_LABELS } from "@/lib/auth";

export type BadgeVariant = "default" | "primary" | "success" | "warning" | "error" | "info" | "outline";
export type BadgeSize = "sm" | "md";

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  title?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-muted-bg text-foreground",
  primary: "bg-primary-light text-primary",
  success: "bg-success-light text-success",
  warning: "bg-warning-light text-warning",
  error: "bg-error-light text-error",
  info: "bg-info-light text-info",
  outline: "border border-border bg-transparent text-foreground",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-1.5 py-0.5 text-[10px] rounded",
  md: "px-2 py-1 text-xs rounded-full",
};

export function Badge({ children, variant = "default", size = "md", className = "", title }: BadgeProps) {
  return (
    <span
      title={title}
      className={`inline-flex items-center font-medium ${variantStyles[variant]} ${sizeStyles[size]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}

const ROLE_VARIANTS: Record<string, BadgeVariant> = {
  platform_admin: "primary",
  chairman: "info",
  secretary: "info",
  treasurer: "warning",
  guard: "default",
  resident: "success",
};

/** Role badge built from Badge primitive. Use for user role display. */
export function RoleBadge({
  role,
  label,
  variant,
  size = "sm",
  className = "",
}: {
  role: string;
  label?: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}) {
  const resolvedVariant = variant ?? ROLE_VARIANTS[role.toLowerCase()] ?? "default";
  const resolvedLabel = label ?? ROLE_LABELS[role] ?? role;
  return (
    <Badge variant={resolvedVariant} size={size} className={className}>
      {resolvedLabel}
    </Badge>
  );
}
