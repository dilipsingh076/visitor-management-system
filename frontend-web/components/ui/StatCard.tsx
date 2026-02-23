"use client";

import type { ReactNode } from "react";

export interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  variant?: "default" | "primary" | "warning" | "success";
}

const variantStyles: Record<NonNullable<StatCardProps["variant"]>, string> = {
  default: "text-muted",
  primary: "text-primary",
  warning: "text-warning",
  success: "text-success",
};

export function StatCard({
  label,
  value,
  icon,
  variant = "default",
}: StatCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-6 hover:shadow-card transition">
      <div className="flex items-center justify-between mb-4">
        <span className="text-muted-foreground text-sm font-medium">{label}</span>
        {icon && (
          <span className="w-10 h-10 rounded-lg bg-muted-bg flex items-center justify-center text-muted">
            {icon}
          </span>
        )}
      </div>
      <p className={`text-3xl font-bold ${variantStyles[variant]}`}>{value}</p>
    </div>
  );
}
