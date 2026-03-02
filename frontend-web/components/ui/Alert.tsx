"use client";

import type { ReactNode } from "react";
import { theme } from "@/lib/theme";

export type AlertVariant = "default" | "success" | "warning" | "error" | "info";

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

const variantMap: Record<AlertVariant, string> = {
  default: theme.alert.default,
  success: theme.alert.success,
  warning: theme.alert.warning,
  error: theme.alert.error,
  info: theme.alert.info,
};

export function Alert({ variant = "default", title, children, action, className = "" }: AlertProps) {
  const classes = [theme.alert.base, variantMap[variant], className].filter(Boolean).join(" ");
  return (
    <div role="alert" className={classes}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {title ? <p className="font-semibold mb-0.5">{title}</p> : null}
          <p>{children}</p>
        </div>
        {action ? <div className="flex-shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
