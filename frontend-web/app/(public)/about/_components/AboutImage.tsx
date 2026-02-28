"use client";

import { useState } from "react";

export function AboutImage() {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-emerald-50 h-full min-h-[400px] flex items-center justify-center">
        <span className="text-4xl text-emerald-400/60" aria-hidden>🏢</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 h-full min-h-[400px]">
      <img
        src="/images/building.jpg"
        alt="Office building - VMS deployments"
        className="w-full h-full object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
}
