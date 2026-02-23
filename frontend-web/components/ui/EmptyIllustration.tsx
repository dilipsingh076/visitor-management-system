"use client";

/** Friendly empty state illustration - clipboard/list with check. */
export function EmptyIllustration({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="48" cy="48" r="40" fill="currentColor" fillOpacity="0.06" />
      <path d="M32 28h32v40H32z" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" rx="4" fill="currentColor" fillOpacity="0.04" />
      <path d="M38 40h20M38 50h14M38 60h20" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="62" cy="52" r="8" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" />
      <path d="M59 52l2 2 4-4" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
