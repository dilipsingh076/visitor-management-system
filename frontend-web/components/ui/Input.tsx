"use client";

import type { InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
  const inputClass = "w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary focus:border-primary outline-none transition " + (error ? "border-error" : "border-border") + " " + className;
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-muted mb-1">{label}</label>}
      <input className={inputClass} {...props} />
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
}
