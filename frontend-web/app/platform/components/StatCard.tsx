"use client";

import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  color?: "default" | "primary" | "success" | "warning" | "error" | "info";
}

export function StatCard({ label, value, icon: Icon, trend, color = "default" }: StatCardProps) {
  const colorClasses = {
    default: "bg-muted-bg text-foreground",
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    error: "bg-error/10 text-error",
    info: "bg-info/10 text-info",
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 hover:shadow-sm transition">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {trend && (
            <p className={`text-xs ${trend.isPositive ? "text-success" : "text-error"}`}>
              {trend.isPositive ? "+" : ""}{trend.value}% {trend.label}
            </p>
          )}
        </div>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
