"use client";

import { forwardRef } from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ variant = "text", width, height, className = "", style, ...props }, ref) => {
    const baseClass = "animate-pulse bg-muted-bg";
    
    const variantClasses = {
      text: "rounded h-4",
      circular: "rounded-full",
      rectangular: "rounded-lg",
    };

    const computedStyle: React.CSSProperties = {
      ...style,
      width: width ?? (variant === "text" ? "100%" : undefined),
      height: height ?? (variant === "circular" ? width : undefined),
    };

    return (
      <div
        ref={ref}
        className={`${baseClass} ${variantClasses[variant]} ${className}`}
        style={computedStyle}
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";

export function CardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <Skeleton variant="text" width="60%" className="mb-4" />
      <Skeleton variant="text" width="100%" className="mb-2" />
      <Skeleton variant="text" width="80%" />
    </div>
  );
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton variant="text" />
        </td>
      ))}
    </tr>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="circular" width={40} height={40} />
      </div>
      <Skeleton variant="text" width="30%" height={32} />
    </div>
  );
}
