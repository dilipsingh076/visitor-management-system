"use client";

import { User } from "lucide-react";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string | null;
  size?: AvatarSize;
  className?: string;
}

const sizeStyles: Record<AvatarSize, { container: string; text: string; icon: string }> = {
  xs: { container: "w-6 h-6", text: "text-[10px]", icon: "w-3 h-3" },
  sm: { container: "w-8 h-8", text: "text-xs", icon: "w-4 h-4" },
  md: { container: "w-10 h-10", text: "text-sm", icon: "w-5 h-5" },
  lg: { container: "w-12 h-12", text: "text-base", icon: "w-6 h-6" },
  xl: { container: "w-16 h-16", text: "text-xl", icon: "w-8 h-8" },
};

export function Avatar({ src, alt, name, size = "md", className = "" }: AvatarProps) {
  const styles = sizeStyles[size];
  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name || "Avatar"}
        className={`${styles.container} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`
        ${styles.container} rounded-full bg-primary/10 
        flex items-center justify-center ${className}
      `}
    >
      {initials ? (
        <span className={`${styles.text} font-semibold text-primary`}>{initials}</span>
      ) : (
        <User className={`${styles.icon} text-primary`} />
      )}
    </div>
  );
}

export function AvatarGroup({
  children,
  max = 4,
  size = "sm",
}: {
  children: React.ReactNode[];
  max?: number;
  size?: AvatarSize;
}) {
  const displayed = children.slice(0, max);
  const remaining = children.length - max;

  return (
    <div className="flex -space-x-2">
      {displayed.map((child, index) => (
        <div key={index} className="ring-2 ring-card rounded-full">
          {child}
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={`
            ${sizeStyles[size].container} rounded-full bg-muted-bg ring-2 ring-card
            flex items-center justify-center
          `}
        >
          <span className={`${sizeStyles[size].text} font-medium text-muted-foreground`}>
            +{remaining}
          </span>
        </div>
      )}
    </div>
  );
}
