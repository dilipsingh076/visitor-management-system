"use client";

/**
 * Small welcome / login illustration - door with checkmark.
 */
export function WelcomeIllustration({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="48" cy="48" r="44" fill="currentColor" fillOpacity="0.08" />
      <rect x="28" y="24" width="40" height="48" rx="4" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <circle cx="48" cy="44" r="6" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" />
      <path d="M44 52l4 4 8-8" stroke="currentColor" strokeOpacity="0.5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
