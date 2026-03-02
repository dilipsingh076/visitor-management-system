"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { theme } from "@/lib/theme";

export type LinkButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type LinkButtonSize = "sm" | "md" | "lg";

export interface LinkButtonProps {
  href: string;
  children: ReactNode;
  variant?: LinkButtonVariant;
  size?: LinkButtonSize;
  className?: string;
}

const base = "rounded-lg font-medium transition inline-flex items-center justify-center gap-2";
const variants: Record<LinkButtonVariant, string> = {
  primary: theme.button.primary,
  secondary: theme.button.secondary,
  outline: "border border-border bg-transparent text-foreground hover:bg-muted-bg hover:border-primary",
  ghost: theme.button.ghost,
};
const sizes: Record<LinkButtonSize, string> = {
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
