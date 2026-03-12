"use client";

import { theme } from "@/lib/theme";

export interface PageLoadingSkeletonProps {
  /** Number of block rows (default 3) */
  rows?: number;
  /** Show input bar (default true) */
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
