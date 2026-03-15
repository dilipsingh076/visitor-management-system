"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { getPrimaryRole, isCommittee } from "@/lib/auth";
import type { User } from "@/lib/auth";
import { useUnreadNotifications, useMarkNotificationRead, useNotificationsStream } from "@/features/visitors";
import { Button } from "@/components/ui";

function canReceiveNotifications(user: User | null): boolean {
  if (!user) return false;
  const role = getPrimaryRole(user);
  return role === "resident" || isCommittee(role);
}

export function NotificationBell({ user }: { user: User | null }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const enabled = Boolean(user) && canReceiveNotifications(user);
  useNotificationsStream(enabled);
  const { data: notifications = [] } = useUnreadNotifications(enabled);
  const markRead = useMarkNotificationRead();
  const count = notifications.length;

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        panelRef.current?.contains(e.target as Node) ||
        buttonRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open]);

  if (!enabled) return null;

  if (count === 0) {
    return (
      <Link
        href="/notifications"
        className="relative flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted-bg transition-colors"
        title="Notifications"
      >
        <span className="sr-only">Visitors</span>
        <Bell className="w-5 h-5" aria-hidden />
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted-bg transition-colors"
        title="Notifications"
        aria-label={`${count} unread notification${count !== 1 ? "s" : ""}`}
      >
        <Bell className="w-5 h-5" aria-hidden />
        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-white">
          {count > 99 ? "99+" : count}
        </span>
      </button>
      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full mt-1 w-80 max-h-[min(20rem,70vh)] overflow-hidden rounded-lg border border-border bg-card shadow-lg z-50"
        >
          <div className="border-b border-border px-3 py-2 bg-muted-bg/50">
            <p className="text-sm font-medium text-foreground">Notifications</p>
            <p className="text-xs text-muted-foreground">Visitor alerts — approve or dismiss</p>
          </div>
          <ul className="divide-y divide-border max-h-64 overflow-y-auto">
            {notifications.map((n) => (
              <li key={n.id} className="px-3 py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                  </div>
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={() => {
                      markRead.mutate(n.id);
                      if (notifications.length <= 1) setOpen(false);
                    }}
                    disabled={markRead.isPending}
                  >
                    Dismiss
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <div className="border-t border-border px-3 py-2 bg-muted-bg/30">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-primary hover:underline"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
