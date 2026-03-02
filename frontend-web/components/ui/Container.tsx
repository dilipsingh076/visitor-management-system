"use client";

import type { ReactNode, HTMLAttributes } from "react";
import { theme } from "@/lib/theme";

export type ContainerSize = "default" | "narrow" | "wide";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: ContainerSize;
  children: ReactNode;
}

const sizeClass: Record<ContainerSize, string> = {
  default: theme.container.base,
  narrow: theme.container.narrow,
  wide: theme.container.wide,
};

export function Container({ size = "default", children, className = "", ...props }: ContainerProps) {
  return (
    <div className={`${sizeClass[size]} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}
