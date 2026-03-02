"use client";

import { forwardRef } from "react";
import { theme } from "@/lib/theme";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, action, className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
        {...props}
      >
        {icon && (
          <div className="w-16 h-16 rounded-2xl bg-muted-bg flex items-center justify-center mb-4 text-muted-foreground">
            {icon}
          </div>
        )}
        <h3 className={`${theme.text.heading1} mb-1`}>{title}</h3>
        {description && <p className={`${theme.text.muted} mb-4 max-w-sm`}>{description}</p>}
        {action && <div className="mt-2">{action}</div>}
      </div>
    );
  }
);

EmptyState.displayName = "EmptyState";
