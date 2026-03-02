"use client";

import type { ReactNode } from "react";
import { theme } from "@/lib/theme";

export interface FormSectionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps form fields in a consistent section style using theme tokens.
 */
export function FormSection({ children, className = "" }: FormSectionProps) {
  return (
    <section
      className={`${theme.space.formSection} ${theme.surface.formSection} ${className}`.trim()}
    >
      {children}
    </section>
  );
}
