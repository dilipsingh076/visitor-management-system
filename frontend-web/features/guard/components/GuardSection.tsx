"use client";

import type { ReactNode } from "react";
import type { GuardSectionVariant } from "../types";

interface GuardSectionProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  variant?: GuardSectionVariant;
  children: ReactNode;
}

const variantClasses: Record<GuardSectionVariant, string> = {
  warning: "border-warning/30 bg-warning-light",
  success: "border-success/30 bg-success-light",
  primary: "border-primary/30 bg-primary-muted",
  default: "border-border bg-muted-bg",
};

const headingClasses: Record<GuardSectionVariant, string> = {
  warning: "text-warning",
  success: "text-success",
  primary: "text-primary",
  default: "text-foreground",
};

export function GuardSection({
  title,
  description,
  icon,
  variant = "default",
  children,
}: GuardSectionProps) {
  return (
    <section>
      <h2 className={`text-base font-semibold mb-0.5 flex items-center gap-2 ${headingClasses[variant]}`}>
        {icon}
        {title}
      </h2>
      {description && (
        <p className="text-muted-foreground text-xs mb-2">{description}</p>
      )}
      <div className={`rounded-lg border overflow-hidden ${variantClasses[variant]}`}>
        {children}
      </div>
    </section>
  );
}
