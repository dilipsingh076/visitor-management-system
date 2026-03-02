"use client";

import type { InputHTMLAttributes } from "react";
import { theme } from "@/lib/theme";
import { Label } from "./Label";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Label (string or node). Use with id for htmlFor. */
  label?: React.ReactNode;
  /** Helper text below the input */
  hint?: React.ReactNode;
  /** Error message (string or node) */
  error?: React.ReactNode;
  /** When true, wrapper has no bottom margin (e.g. inside FormSection with space-y) */
  noMargin?: boolean;
}

export function Input({
  label,
  hint,
  error,
  noMargin,
  id,
  className = "",
  ...props
}: InputProps) {
  const hasError = error != null && (typeof error !== "string" || error !== "");
  return (
    <div className={noMargin ? "" : "mb-4"}>
      {label != null && (
        <Label htmlFor={id}>{label}</Label>
      )}
      <input
        id={id}
        className={`${theme.input.base} rounded-lg ${hasError ? theme.input.error : ""} ${className}`.trim()}
        aria-invalid={!!hasError}
        aria-describedby={id && (hint || error) ? `${id}-hint` : undefined}
        {...props}
      />
      {hint != null && (
        <p id={id ? `${id}-hint` : undefined} className={theme.text.hint}>
          {hint}
        </p>
      )}
      {error != null && (typeof error !== "string" || error !== "") && (
        <p className={theme.text.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
