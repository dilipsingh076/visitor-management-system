"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Visitors page failed to load
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          {error?.message || "Something went wrong."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

