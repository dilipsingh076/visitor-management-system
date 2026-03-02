"use client";

import type { ReactNode } from "react";
import { Label } from "./Label";

export interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function FormField({ label, error, required, children }: FormFieldProps) {
  return (
    <div className="mb-4">
      {label && <Label required={required}>{label}</Label>}
      {children}
      {error && <p className="mt-1.5 text-xs text-error" role="alert">{error}</p>}
    </div>
  );
}
