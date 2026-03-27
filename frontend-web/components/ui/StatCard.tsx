"use client";

import type { ReactNode } from "react";
import { theme } from "@/lib/theme";

export interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  variant?: "default" | "primary" | "warning" | "success" | "info";
  gradient?: boolean;
}

const gradientRoots: Record<string, string> = {
  primary: theme.statCard.rootGradientPrimary,
  warning: theme.statCard.rootGradientWarning,
  success: theme.statCard.rootGradientSuccess,
  info: theme.statCard.rootGradientInfo,
};

const iconStyles: Record<string, string> = {
  default: theme.statCard.iconDefault,
  primary: theme.statCard.iconPrimary,
  warning: theme.statCard.iconWarning,
  success: theme.statCard.iconSuccess,
  info: "bg-info/10 text-info",
};

const valueStyles: Record<string, string> = {
  default: "text-foreground",
  primary: "text-primary",
  warning: "text-warning",
  success: "text-success",
  info: "text-info",
};

export function StatCard({
  label,
  value,
  icon,
  variant = "default",
  gradient = false,
}: StatCardProps) {
  const isGradient = gradient && variant !== "default" && gradientRoots[variant];

  if (isGradient) {
    return (
      <div className={gradientRoots[variant]}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-white/80 text-xs font-medium">{label}</span>
          {icon && (
            <span className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center text-white">
              {icon}
            </span>
          )}
        </div>
        <p className={theme.statCard.valueWhite}>{value}</p>
      </div>
    );
  }

  return (
    <div className={theme.statCard.root}>
      <div className="flex items-center justify-between mb-3">
        <span className={theme.statCard.label}>{label}</span>
        {icon && (
          <span className={`${theme.statCard.iconWrap} ${iconStyles[variant] ?? iconStyles.default}`}>
            {icon}
          </span>
        )}
      </div>
      <p className={`${theme.statCard.value} ${valueStyles[variant] ?? ""}`}>{value}</p>
    </div>
  );
}
