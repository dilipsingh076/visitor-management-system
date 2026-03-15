"use client";

import type { ReactNode, ButtonHTMLAttributes } from "react";
import { theme } from "@/lib/theme";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "destructive" | "link";
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  /** Loading state (spinner / disabled). Alias: isLoading for platform compatibility. */
  loading?: boolean;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary: theme.button.primary,
  secondary: theme.button.secondary,
  outline: "border border-border bg-transparent text-foreground hover:bg-muted-bg hover:border-primary",
  ghost: theme.button.ghost,
  danger: theme.button.danger,
  destructive: theme.button.danger,
  link: theme.button.link,
};

const sizes: Record<ButtonSize, string> = {
  xs: "px-2.5 py-1 text-xs rounded-md gap-1",
  sm: "px-3 py-1.5 text-sm rounded-lg gap-1.5",
  md: "px-4 py-2 text-sm rounded-lg gap-2",
  lg: "px-6 py-3 text-base rounded-xl gap-2",
  icon: "h-9 w-9 p-0 rounded-lg shrink-0",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth,
  loading,
  isLoading,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const isPending = loading ?? isLoading ?? false;
  const isLink = variant === "link";
  const base = isLink ? "underline-offset-2 hover:underline" : theme.button.base;
  const isIconOnly = size === "icon" && !children;
  return (
    <button
      type={isLink ? "button" : undefined}
      className={`inline-flex items-center justify-center ${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`.trim()}
      disabled={disabled ?? isPending}
      {...props}
    >
      {isPending ? (
        <span className={isIconOnly ? "inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" : "animate-pulse"}>{" "}</span>
      ) : (
        <>
          {leftIcon && <span className="shrink-0 [&>svg]:w-4 [&>svg]:h-4">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0 [&>svg]:w-4 [&>svg]:h-4">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}
