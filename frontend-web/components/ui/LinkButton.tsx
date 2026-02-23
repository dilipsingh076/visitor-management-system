"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export interface LinkButtonProps {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const base = "rounded-lg font-medium transition inline-flex items-center justify-center gap-2";
const variants = {
  primary: "bg-primary hover:bg-primary-hover text-white",
  secondary: "bg-muted-bg hover:bg-border text-foreground border border-border",
};
const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function LinkButton({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`.trim()}
    >
      {children}
    </Link>
  );
}
