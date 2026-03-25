"use client";

import type { ReactNode } from "react";

export interface SettingsRowProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action: ReactNode;
  className?: string;
}

/**
 * Two-column settings row: label stack on the left, control on the right.
 */
export function SettingsRow({ title, description, icon, action, className = "" }: SettingsRowProps) {
  return (
    <div
      className={`flex items-start justify-between gap-4 border-b border-border py-3 last:border-0 ${className}`.trim()}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {icon ? (
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted-bg text-muted-foreground">
            {icon}
          </div>
        ) : null}
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{title}</p>
          {description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      <div className="shrink-0 pt-0.5">{action}</div>
    </div>
  );
}
