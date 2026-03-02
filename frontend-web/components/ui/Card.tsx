"use client";

import type { ReactNode, HTMLAttributes } from "react";
import { theme } from "@/lib/theme";

export type CardVariant = "default" | "elevated" | "outlined";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children: ReactNode;
  className?: string;
}

const variantClass: Record<CardVariant, string> = {
  default: "bg-card rounded-xl border border-border shadow-soft",
  elevated: "bg-card rounded-xl border border-border shadow-card",
  outlined: "bg-card rounded-xl border border-border",
};

export function Card({ variant = "default", children, className = "", ...props }: CardProps) {
  return (
    <div className={`${variantClass[variant]} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function CardHeader({ children, className = "", action }: CardHeaderProps) {
  return (
    <div className={`${theme.surface.cardHeader} px-4 py-3 sm:px-6 flex items-center justify-between ${className}`.trim()}>
      <div>{children}</div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return <div className={`p-4 sm:p-6 ${className}`.trim()}>{children}</div>;
}

export interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  return (
    <div className={`${theme.surface.cardFooter} px-4 py-3 sm:px-6 ${className}`.trim()}>
      {children}
    </div>
  );
}
