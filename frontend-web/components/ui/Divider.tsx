"use client";

import type { ReactNode, HTMLAttributes } from "react";
import { theme } from "@/lib/theme";

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  label?: ReactNode;
  className?: string;
}

export function Divider({ label, className = "", ...props }: DividerProps) {
  if (label != null) {
    return (
      <div className={`${theme.divider.withLabel} ${className}`.trim()} {...(props as HTMLAttributes<HTMLDivElement>)}>
        <span className={theme.divider.line} />
        <span>{label}</span>
        <span className={theme.divider.line} />
      </div>
    );
  }
  return <hr className={`${theme.divider.horizontal} ${className}`.trim()} {...props} />;
}
