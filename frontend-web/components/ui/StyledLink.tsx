"use client";

import Link from "next/link";
import type { ReactNode, ComponentProps } from "react";
import { theme } from "@/lib/theme";

export interface StyledLinkProps extends Omit<ComponentProps<typeof Link>, "className"> {
  children: ReactNode;
  variant?: "default" | "footer" | "muted";
  className?: string;
}

const variantClass = {
  default: theme.auth.link,
  footer: theme.footer.link,
  muted: theme.auth.linkMuted,
};

export function StyledLink({ children, variant = "default", className = "", ...props }: StyledLinkProps) {
  return (
    <Link className={`${variantClass[variant]} ${className}`.trim()} {...props}>
      {children}
    </Link>
  );
}
