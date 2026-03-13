"use client";

type SpinnerSize = "xs" | "sm" | "md" | "lg";

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const sizeStyles: Record<SpinnerSize, string> = {
  xs: "w-3 h-3 border",
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-8 h-8 border-2",
};

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <div
      className={`
        ${sizeStyles[size]} rounded-full border-primary/30 border-t-primary animate-spin
        ${className}
      `}
    />
  );
}

export function PageLoader({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Spinner size="lg" />
      {message && <p className="mt-3 text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}

export function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`h-4 bg-muted-bg rounded animate-pulse ${className}`} />;
}

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`h-20 bg-muted-bg rounded-lg animate-pulse ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-3">
      <SkeletonLine className="w-1/3" />
      <SkeletonLine className="w-full" />
      <SkeletonLine className="w-2/3" />
    </div>
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
