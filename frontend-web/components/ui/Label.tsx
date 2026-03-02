"use client";

import type { LabelHTMLAttributes } from "react";
import { theme } from "@/lib/theme";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

/**
 * Form label using theme. Use with Input, Select, or any form control (pass htmlFor to match id).
 */
export function Label({ children, required, className = "", ...props }: LabelProps) {
  return (
    <label className={`${theme.text.label} ${className}`.trim()} {...props}>
      {children}
      {required && <span className="text-error ml-0.5">*</span>}
    </label>
  );
}
