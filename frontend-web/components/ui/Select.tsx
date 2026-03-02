"use client";

import type { SelectHTMLAttributes } from "react";
import { theme } from "@/lib/theme";
import { Label } from "./Label";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: React.ReactNode;
  options: SelectOption[];
  error?: string;
}

/**
 * Select using theme. Pass id and label (with htmlFor via id) for accessibility.
 */
export function Select({ label, options, error, id, className = "", ...props }: SelectProps) {
  return (
    <div>
      {label != null && (
        <Label htmlFor={id}>{label}</Label>
      )}
      <select
        id={id}
        className={`${theme.select.base} rounded-lg ${error ? theme.input.error : ""} ${className}`.trim()}
        aria-invalid={!!error}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value || "empty"} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className={theme.text.error}>{error}</p>}
    </div>
  );
}
