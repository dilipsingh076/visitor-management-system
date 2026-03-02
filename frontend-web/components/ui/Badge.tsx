"use client";

import type { ReactNode } from "react";

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
