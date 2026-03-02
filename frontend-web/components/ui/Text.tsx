"use client";

import type { ReactNode, ElementType } from "react";

export type TextVariant = "h1" | "h2" | "h3" | "h4" | "body" | "bodySmall" | "caption" | "muted" | "label";

const variantClass: Record<TextVariant, string> = {
  h1: "text-3xl font-bold text-foreground tracking-tight",
  h2: "text-2xl font-bold text-foreground tracking-tight",
  h3: "text-xl font-semibold text-foreground",
  h4: "text-lg font-semibold text-foreground",
  body: "text-sm leading-relaxed text-foreground",
  bodySmall: "text-xs leading-relaxed text-foreground",
  caption: "text-xs text-muted-foreground",
  muted: "text-sm text-muted-foreground",
  label: "block text-sm font-medium text-foreground mb-1.5",
};

const defaultTag: Record<TextVariant, ElementType> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  body: "p",
  bodySmall: "p",
  caption: "span",
  muted: "p",
  label: "span",
};

export interface TextProps {
  variant?: TextVariant;
  as?: ElementType;
  children: ReactNode;
  className?: string;
}

export function Text( props: TextProps ) {
  const { variant = "body", as, children, className = "" } = props;
  const Component = as ?? defaultTag[variant];
  return <Component className={`${variantClass[variant]} ${className}`.trim()}>{children}</Component>;
}
