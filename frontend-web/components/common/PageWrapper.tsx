"use client";

import type { ReactNode } from "react";
import { theme } from "@/lib/theme";

export type PageWidth = "narrower" | "narrow" | "wide" | "wide-xl";

export interface PageWrapperProps {
  children: ReactNode;
  width?: PageWidth;
  className?: string;
}

const widthClass: Record<PageWidth, string> = {
  narrower: theme.container.narrower,
  narrow: theme.container.narrow,
  wide: theme.container.wide,
  "wide-xl": theme.container["wide-xl"],
};

export function PageWrapper({ children, width = "narrow", className = "" }: PageWrapperProps) {
  return (
    <div className={`${widthClass[width]} ${className}`.trim()}>
      {children}
    </div>
  );
}
