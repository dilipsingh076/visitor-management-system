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
      className={`flex ${centered ? "flex-col text-center items-center" : "justify-between items-center"} mb-8 gap-4`}
    >
      <div className={centered ? "max-w-2xl" : ""}>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        {description && <p className="text-muted mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}
