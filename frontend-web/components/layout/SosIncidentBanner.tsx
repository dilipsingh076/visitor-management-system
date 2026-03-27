"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui";
import { getPrimaryRole, isCommittee } from "@/lib/auth";
import { useActiveSos, useResolveSos } from "@/features/sos";
import type { User } from "@/features/auth/types";

function formatTimeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(0, Math.floor(ms / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function severity(type: string): "critical" | "high" | "medium" | "low" {
  switch ((type || "").toLowerCase()) {
    case "fire":
      return "critical";
    case "medical":
    case "theft":
      return "high";
    case "lift":
      return "medium";
    default:
      return "low";
  }
}

function severityClasses(sev: ReturnType<typeof severity>): { wrapper: string; title: string } {
  switch (sev) {
    case "critical":
      return { wrapper: "border-red-600 bg-red-600/5", title: "text-red-700" };
    case "high":
      return { wrapper: "border-orange-600 bg-orange-600/5", title: "text-orange-700" };
    case "medium":
      return { wrapper: "border-amber-600 bg-amber-600/5", title: "text-amber-700" };
    default:
      return { wrapper: "border-yellow-600 bg-yellow-600/5", title: "text-yellow-700" };
  }
}

function canAck(user: User): boolean {
  const role = getPrimaryRole(user as any);
  return role === "guard" || isCommittee(role);
}

export function SosIncidentBanner({ user }: { user: User }) {
  const enabled = Boolean((user as any)?.society_id);
  const activeQ = useActiveSos(enabled);
  const resolveM = useResolveSos();

  const incident = activeQ.data;
  const open = incident && incident.status === "open";
  const sev = useMemo(() => (open ? severity(incident.type) : "low"), [incident?.type, open]);
  const cls = severityClasses(sev);

  if (!open) return null;

  const showResolve = canAck(user);

  return (
    <div
      className={`mt-3 mx-4 lg:mx-6 rounded-xl border border-border/60 border-l-4 ${cls.wrapper} px-4 py-3 shadow-sm`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-sm font-semibold ${cls.title}`}>
            SOS: {(incident.type || "OTHER").toUpperCase()}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Raised {formatTimeAgo(incident.created_at)}
            {incident.raised_by_name ? ` by ${incident.raised_by_name}` : ""}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <Link href="/notifications" className="text-sm font-medium text-primary hover:underline">
            View
          </Link>
          {showResolve && (
            <Button
              size="xs"
              variant="danger"
              onClick={() => resolveM.mutate(incident.id)}
              loading={resolveM.isPending}
            >
              Resolve
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

