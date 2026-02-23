"use client";

/**
 * Friendly hero illustration: building + shield (visitor management).
 * Simple, non-complex, works at any size.
 */
export function HeroIllustration({ className = "w-48 h-48" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Soft background circle */}
      <circle cx="100" cy="100" r="88" fill="currentColor" fillOpacity="0.06" />
      <circle cx="100" cy="100" r="72" fill="currentColor" fillOpacity="0.04" />
      {/* Building silhouette - simple towers */}
      <path
        d="M60 160V70l40-30 40 30v90H60z"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect x="72" y="95" width="12" height="12" rx="2" fill="currentColor" fillOpacity="0.2" />
      <rect x="92" y="95" width="16" height="12" rx="2" fill="currentColor" fillOpacity="0.25" />
      <rect x="116" y="95" width="12" height="12" rx="2" fill="currentColor" fillOpacity="0.2" />
      <rect x="72" y="120" width="12" height="12" rx="2" fill="currentColor" fillOpacity="0.15" />
      <rect x="92" y="120" width="16" height="12" rx="2" fill="currentColor" fillOpacity="0.15" />
      <rect x="116" y="120" width="12" height="12" rx="2" fill="currentColor" fillOpacity="0.15" />
      {/* Shield - security */}
      <path
        d="M100 42c-12 0-22 8-22 18v8c0 20 22 32 22 32s22-12 22-32v-8c0-10-10-18-22-18z"
        fill="currentColor"
        fillOpacity="0.15"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M100 58v24l8 6"
        stroke="currentColor"
        strokeOpacity="0.4"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Small person at bottom - visitor */}
      <circle cx="100" cy="168" r="10" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" />
      <path d="M100 158v-6" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
