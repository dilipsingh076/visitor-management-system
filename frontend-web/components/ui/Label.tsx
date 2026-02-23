"use client";

import type { LabelHTMLAttributes } from "react";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ children, required, className = "", ...props }: LabelProps) {
  return (
    <label className={`block text-sm font-medium text-muted mb-1 ${className}`} {...props}>
      {children}
      {required && <span className="text-error ml-0.5">*</span>}
    </label>
  );
}
