"use client";

import { forwardRef } from "react";

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
        <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
        {description && <p className="text-muted-foreground text-sm mb-4 max-w-sm">{description}</p>}
        {action && <div className="mt-2">{action}</div>}
      </div>
    );
  }
);

EmptyState.displayName = "EmptyState";
