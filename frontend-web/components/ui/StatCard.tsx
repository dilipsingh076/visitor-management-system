"use client";

import type { ReactNode } from "react";
import { theme } from "@/lib/theme";

export interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  variant?: "default" | "primary" | "warning" | "success";
}

const variantStyles: Record<NonNullable<StatCardProps["variant"]>, string> = {
  default: "text-muted-foreground",
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
    <div className={`bg-card rounded-xl border border-border p-6 hover:shadow-card transition`}>
      <div className="flex items-center justify-between mb-4">
        <span className={theme.text.muted}>{label}</span>
        {icon && (
          <span className="w-10 h-10 rounded-lg bg-muted-bg flex items-center justify-center text-muted-foreground">
            {icon}
          </span>
        )}
      </div>
      <p className={`text-3xl font-bold ${variantStyles[variant]}`}>{value}</p>
    </div>
  );
}
