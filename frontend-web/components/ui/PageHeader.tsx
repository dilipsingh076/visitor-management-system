"use client";

import type { ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  /** Centered layout for marketing pages */
  centered?: boolean;
}

export function PageHeader({ title, description, action, centered }: PageHeaderProps) {
  return (
    <div
      className={`flex ${centered ? "flex-col text-center items-center" : "flex-col sm:flex-row sm:justify-between sm:items-center"} mb-4 gap-3`}
    >
      <div className={centered ? "max-w-2xl" : "min-w-0"}>
        <h1 className="text-xl font-semibold text-foreground tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm max-w-2xl">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
