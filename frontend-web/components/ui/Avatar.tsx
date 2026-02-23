"use client";

import { forwardRef } from "react";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
};

const colorClasses = [
  "bg-primary-light text-primary",
  "bg-success-light text-success",
  "bg-warning-light text-warning",
  "bg-info-light text-info",
  "bg-error-light text-error",
];

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getColorClass(name?: string): string {
  if (!name) return colorClasses[0];
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colorClasses[hash % colorClasses.length];
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, name, size = "md", className = "", ...props }, ref) => {
    const initials = getInitials(name || alt);
    const colorClass = getColorClass(name || alt);

    if (src) {
      return (
        <div
          ref={ref}
          className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 ${className}`}
          {...props}
        >
          <img
            src={src}
            alt={alt || name || "Avatar"}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="flex items-center justify-center w-full h-full ${colorClass} font-semibold">${initials}</span>`;
            }}
          />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={`${sizeClasses[size]} ${colorClass} rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${className}`}
        {...props}
      >
        {initials}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";
