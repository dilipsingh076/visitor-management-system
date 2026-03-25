"use client";

import type { ButtonHTMLAttributes } from "react";
import { theme } from "@/lib/theme";

export interface FilterChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** When true, uses active pill styling */
  selected?: boolean;
}

/**
 * Pill-style filter button (URL-agnostic). Uses theme filter pill styles.
 */
export function FilterChip({
  selected = false,
  className = "",
  children,
  type = "button",
  ...props
}: FilterChipProps) {
  return (
    <button
      type={type}
      className={`${theme.filterPill.base} ${
        selected ? theme.filterPill.active : theme.filterPill.inactive
      } ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
