"use client";

/**
 * Central skeleton loaders. Use these across the app to avoid duplication.
 * Re-exported from @/components/ui and @/components/common for backward compatibility.
 */

import { forwardRef } from "react";
import { theme } from "@/lib/theme";

// ----- Base -----

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

export function SkeletonLine({ className = "" }: { className?: string }) {
  return <Skeleton variant="text" className={`h-4 ${className}`.trim()} />;
}

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <Skeleton variant="rectangular" className={`h-20 ${className}`.trim()} />;
}

// ----- Card -----

export function CardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <SkeletonLine className="w-2/3 mb-4" />
      <SkeletonLine className="mb-2" />
      <SkeletonLine className="w-4/5" />
    </div>
  );
}

/** Alias for CardSkeleton (platform uses SkeletonCard name). */
export function SkeletonCard() {
  return <CardSkeleton />;
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

// ----- Table -----

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

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="border-b border-border bg-muted-bg/50 p-3">
        <div className="flex gap-4">
          {[...Array(cols)].map((_, i) => (
            <SkeletonLine key={i} className="flex-1" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-border">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="p-3 flex gap-4">
            {[...Array(cols)].map((_, j) => (
              <SkeletonLine key={j} className="flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ----- Page loading -----

export interface PageLoadingSkeletonProps {
  rows?: number;
  showInput?: boolean;
}

export function PageLoadingSkeleton({ rows = 3, showInput = true }: PageLoadingSkeletonProps) {
  return (
    <div className={theme.loading.page}>
      <div className={theme.loading.line} />
      {showInput && <div className={theme.loading.input} />}
      <div className="space-y-2">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className={theme.loading.block} />
        ))}
      </div>
    </div>
  );
}

export function PageLoadingSkeletonCard() {
  return (
    <div className={theme.loading.page}>
      <div className={theme.loading.line} />
      <div className={theme.loading.input} />
      <div className={theme.loading.card} />
    </div>
  );
}
