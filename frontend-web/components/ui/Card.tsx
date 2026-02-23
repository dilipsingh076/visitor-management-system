"use client";

import type { ReactNode } from "react";

export interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-card rounded-xl border border-border shadow-soft ${className}`}>
      {children}
    </div>
  );
}
