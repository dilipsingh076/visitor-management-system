"use client";

import { theme } from "@/lib/theme";
import type { ReactNode } from "react";

export interface NotificationBannerItem {
  id: string;
  title: string;
  body?: string;
}

export interface NotificationBannerProps {
  items: NotificationBannerItem[];
  onDismiss: (id: string) => void;
  dismissingId?: string | null;
  className?: string;
  dismissLabel?: string;
}

export function NotificationBanner({
  items,
  onDismiss,
  dismissingId = null,
  className = "",
  dismissLabel = "Dismiss",
}: NotificationBannerProps) {
  if (items.length === 0) return null;

  return (
    <div className={`space-y-1.5 mb-4 ${className}`.trim()}>
      {items.map((n) => (
        <div
          key={n.id}
          className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${theme.alert.success}`}
        >
          <div className="min-w-0">
            <p className={`font-medium truncate ${theme.text.small}`} style={{ color: "inherit" }}>
              {n.title}
            </p>
            {n.body && (
              <p className={`text-xs truncate opacity-90`}>{n.body}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onDismiss(n.id)}
            disabled={dismissingId === n.id}
            className="shrink-0 ml-2 px-2 py-1 text-xs bg-success text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 transition"
          >
            {dismissLabel}
          </button>
        </div>
      ))}
    </div>
  );
}
