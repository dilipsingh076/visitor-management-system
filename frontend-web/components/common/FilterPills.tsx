"use client";

import Link from "next/link";
import { theme } from "@/lib/theme";

export interface FilterOption {
  value: string;
  label: string;
  href: string;
  /** Use theme.filterPill key for active style (e.g. 'pending', 'approved') or 'active' for default */
  activeVariant?: keyof typeof theme.filterPill;
}

export interface FilterPillsProps {
  options: FilterOption[];
  currentValue: string;
  className?: string;
}

export function FilterPills({ options, currentValue, className = "" }: FilterPillsProps) {
  return (
    <div className={`flex gap-1.5 flex-wrap ${className}`.trim()}>
      {options.map((opt) => {
        const isActive = currentValue === opt.value;
        const activeClass =
          isActive && opt.activeVariant && theme.filterPill[opt.activeVariant]
            ? theme.filterPill[opt.activeVariant]
            : isActive
              ? theme.filterPill.active
              : theme.filterPill.inactive;
        return (
          <Link
            key={opt.value}
            href={opt.href}
            className={`${theme.filterPill.base} ${activeClass}`}
          >
            {opt.label}
          </Link>
        );
      })}
    </div>
  );
}
