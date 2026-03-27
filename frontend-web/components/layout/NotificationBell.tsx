"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { getPrimaryRole, isCommittee } from "@/lib/auth";
import type { User } from "@/lib/auth";
import { useUnreadNotifications, useMarkNotificationRead, useNotificationsStream, useApproveVisit, useRejectVisit } from "@/features/visitors";
import { Button } from "@/components/ui";

type SosSeverity = "critical" | "high" | "medium" | "low";

function parseExtra(extra: string | null | undefined): Record<string, unknown> | null {
  if (!extra) return null;
  try {
    return JSON.parse(extra) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function getSosSeverity(sosType: string | null): SosSeverity {
  switch (sosType) {
    case "fire":
      return "critical";
    case "theft":
    case "medical":
      return "high";
    case "lift":
      return "medium";
    case "other":
    default:
      return "low";
  }
}

function sosItemClasses(sev: SosSeverity): { li: string; tag: string; label: string } {
  switch (sev) {
    case "critical":
      return { li: "border-l-4 border-red-600 bg-red-600/5", tag: "bg-red-600/10 text-red-700 border border-red-600/20", label: "CRITICAL" };
    case "high":
      return { li: "border-l-4 border-orange-600 bg-orange-600/5", tag: "bg-orange-600/10 text-orange-700 border border-orange-600/20", label: "HIGH" };
    case "medium":
      return { li: "border-l-4 border-amber-600 bg-amber-600/5", tag: "bg-amber-600/10 text-amber-700 border border-amber-600/20", label: "MEDIUM" };
    case "low":
    default:
      return { li: "border-l-4 border-yellow-600 bg-yellow-600/5", tag: "bg-yellow-600/10 text-yellow-700 border border-yellow-600/20", label: "LOW" };
  }
}

function canReceiveNotifications(user: User | null): boolean {
  if (!user) return false;
  const role = getPrimaryRole(user);
  return role === "resident" || role === "guard" || isCommittee(role);
}

export function NotificationBell({ user }: { user: User | null }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const enabled = Boolean(user) && canReceiveNotifications(user);
  useNotificationsStream(enabled);
  const { data: notifications = [] } = useUnreadNotifications(enabled);
  const markRead = useMarkNotificationRead();
  const approveMutation = useApproveVisit();
  const rejectMutation = useRejectVisit();
  const [actionedIds, setActionedIds] = useState<Set<string>>(new Set());
  const count = notifications.length;

  const getVisitId = useCallback((extraData?: string | null): string | null => {
    if (!extraData) return null;
    try {
      const parsed = JSON.parse(extraData);
      return typeof parsed.visit_id === "string" ? parsed.visit_id : null;
    } catch {
      return null;
    }
  }, []);

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
            {notifications.map((n) => {
              const visitId = getVisitId(n.extra_data);
              const canAction = n.type === "walkin_pending" && visitId && !actionedIds.has(n.id);
              const isSos = n.type === "sos_alert";
              const sosType = isSos ? String(parseExtra(n.extra_data)?.type ?? "").toLowerCase() : null;
              const sev = isSos ? getSosSeverity(sosType) : null;
              const hl = sev ? sosItemClasses(sev) : null;
              return (
                <li key={n.id} className={`px-3 py-2.5 ${hl?.li ?? ""}`.trim()}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                        {isSos && hl && (
                          <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${hl.tag}`.trim()}>
                            SOS · {hl.label}
                          </span>
                        )}
                      </div>
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
                  {canAction && (
                    <div className="flex gap-1.5 mt-1.5">
                      <Button
                        size="xs"
                        variant="primary"
                        onClick={() => {
                          approveMutation.mutate(visitId, {
                            onSuccess: () => {
                              setActionedIds((prev) => new Set(prev).add(n.id));
                              markRead.mutate(n.id);
                              if (notifications.length <= 1) setOpen(false);
                            },
                          });
                        }}
                        disabled={approveMutation.isPending}
                      >
                        {approveMutation.isPending ? "…" : "Approve"}
                      </Button>
                      <Button
                        size="xs"
                        variant="danger"
                        onClick={() => {
                          rejectMutation.mutate(visitId, {
                            onSuccess: () => {
                              setActionedIds((prev) => new Set(prev).add(n.id));
                              markRead.mutate(n.id);
                              if (notifications.length <= 1) setOpen(false);
                            },
                          });
                        }}
                        disabled={rejectMutation.isPending}
                      >
                        {rejectMutation.isPending ? "…" : "Reject"}
                      </Button>
                    </div>
                  )}
                  {actionedIds.has(n.id) && (
                    <span className="text-xs text-success mt-1 block">Done</span>
                  )}
                </li>
              );
            })}
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
