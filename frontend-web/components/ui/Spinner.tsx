"use client";

import type { ReactNode } from "react";

export type SpinnerSize = "sm" | "md" | "lg";

export interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const sizeClass: Record<SpinnerSize, string> = {
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-8 h-8 border-[3px]",
};

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block rounded-full border-primary border-t-transparent animate-spin ${sizeClass[size]} ${className}`.trim()}
    />
  );
}

/** Full-page loading state. Use in loading.tsx or when a whole section is loading. */
export function PageLoader({ message }: { message?: ReactNode } = {}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] py-12">
      <Spinner size="lg" />
      {message && (
        <p className="mt-3 text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
}
