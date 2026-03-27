"use client";

import type { ReactNode } from "react";

export type PageWidth = "narrower" | "narrow" | "wide" | "wide-xl" | "full";

export interface PageWrapperProps {
  children: ReactNode;
  width?: PageWidth;
  className?: string;
}

const widthClass: Record<PageWidth, string> = {
  narrower: "max-w-lg mx-auto px-4 sm:px-6 py-6",
  narrow: "max-w-4xl mx-auto px-4 sm:px-6 py-6",
  wide: "max-w-6xl mx-auto px-4 sm:px-6 py-6",
  "wide-xl": "max-w-[90rem] mx-auto px-4 sm:px-6",
  full: "w-full py-6",
};

export function PageWrapper({ children, width = "wide", className = "" }: PageWrapperProps) {
  return (
    <div className={`${widthClass[width]} page-enter ${className}`.trim()}>
      {children}
    </div>
  );
}
