"use client";

import type { ButtonHTMLAttributes } from "react";

export interface SwitchProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "role"> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

/**
 * Accessible toggle (role="switch"). Pair with a visible label (aria-labelledby) or aria-label.
 */
export function Switch({
  checked,
  onCheckedChange,
  disabled,
  className = "",
  ...props
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        checked ? "bg-primary" : "border border-border bg-muted-bg"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""} ${className}`.trim()}
      {...props}
    >
      <span
        className={`pointer-events-none absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
        aria-hidden
      />
    </button>
  );
}
