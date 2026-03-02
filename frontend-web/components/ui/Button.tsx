"use client";

import type { ReactNode, ButtonHTMLAttributes } from "react";
import { theme } from "@/lib/theme";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "link";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary: theme.button.primary,
  secondary: theme.button.secondary,
  outline: "border border-border bg-transparent text-foreground hover:bg-muted-bg hover:border-primary",
  ghost: theme.button.ghost,
  danger: theme.button.danger,
  link: theme.button.link,
};

const sizes: Record<ButtonSize, string> = {
  xs: "px-2.5 py-1 text-xs rounded-md",
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-4 py-2 text-sm rounded-lg",
  lg: "px-6 py-3 text-base rounded-xl",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth,
  loading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const isLink = variant === "link";
  const base = isLink ? "underline-offset-2 hover:underline" : theme.button.base;
  return (
    <button
      type={isLink ? "button" : undefined}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`.trim()}
      disabled={disabled ?? loading}
      {...props}
    >
      {loading ? "…" : children}
    </button>
  );
}
