"use client";

import { useSearchParams } from "next/navigation";
import { canInviteVisitor, getPrimaryRole, isSocietyAdmin } from "@/lib/auth";
import { useAuth } from "@/features/auth";
import Link from "next/link";
import { PageHeader, LinkButton, Card } from "@/components/ui";
import {
  useVisitorsList,
  useUnreadNotifications,
  useMarkNotificationRead,
  useApproveVisit,
  type VisitorsStatusFilter,
  type VisitorsScope,
} from "@/features/visitors";

export function VisitorsPageContent() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") || "";
  const { user, loading: authLoading } = useAuth({ requireAuth: true });

  if (!user) return null;

  const role = getPrimaryRole(user);
  const scope: VisitorsScope = role === "resident" ? "me" : "all";
  const allowedStatuses = new Set(["", "pending", "approved", "checked_in", "checked_out", "cancelled"]);
  const status: VisitorsStatusFilter = allowedStatuses.has(statusFilter)
    ? (statusFilter as VisitorsStatusFilter)
    : "";

  const visitsQ = useVisitorsList({ status, scope, enabled: Boolean(user) });
  const notificationsQ = useUnreadNotifications(Boolean(user) && (role === "resident" || isSocietyAdmin(role)));
  const markReadMutation = useMarkNotificationRead();
  const approveMutation = useApproveVisit();

  const visits = visitsQ.data ?? [];
  const notifications = notificationsQ.data ?? [];
  const approvingId = approveMutation.isPending ? (approveMutation.variables as string) : null;
  const loadingState = authLoading || visitsQ.isLoading || notificationsQ.isLoading;

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      pending: "bg-warning-light text-warning",
      approved: "bg-info-light text-info",
      checked_in: "bg-success-light text-success",
      checked_out: "bg-muted-bg text-foreground",
      cancelled: "bg-error-light text-error",
    };
    return map[s] || "bg-muted-bg text-foreground";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader
        title="Visitors"
        description={canInviteVisitor(user) ? "Pending invites need your approval." : "View visits (guards & committee see all)."}
        action={canInviteVisitor(user) ? <LinkButton href="/visitors/invite" variant="primary" size="sm">+ Invite</LinkButton> : undefined}
      />
      {notifications.length > 0 && (
        <div className="mb-4 space-y-1.5">
          {notifications.map((n) => (
            <div key={n.id} className="flex items-center justify-between px-3 py-2 bg-success-light border border-success/30 rounded-lg text-sm">
              <div className="min-w-0">
                <p className="font-medium text-success truncate">{n.title}</p>
                <p className="text-xs text-muted truncate">{n.body}</p>
              </div>
              <button onClick={() => markReadMutation.mutate(n.id)} disabled={markReadMutation.isPending} className="shrink-0 ml-2 px-2 py-1 text-xs bg-success text-white rounded hover:bg-green-700">
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        <Link href="/visitors" className={`px-3 py-1.5 rounded-lg text-xs font-medium ${!statusFilter ? "bg-border text-foreground" : "bg-muted-bg text-muted hover:bg-border"}`}>All</Link>
        <Link href="/visitors?status=pending" className={`px-3 py-1.5 rounded-lg text-xs font-medium ${statusFilter === "pending" ? "bg-warning-light text-warning" : "bg-muted-bg text-muted hover:bg-border"}`}>Pending</Link>
        <Link href="/visitors?status=approved" className={`px-3 py-1.5 rounded-lg text-xs font-medium ${statusFilter === "approved" ? "bg-info-light text-info" : "bg-muted-bg text-muted hover:bg-border"}`}>Approved</Link>
        <Link href="/visitors?status=checked_in" className={`px-3 py-1.5 rounded-lg text-xs font-medium ${statusFilter === "checked_in" ? "bg-primary-light text-primary" : "bg-muted-bg text-muted hover:bg-border"}`}>Checked in</Link>
      </div>
      <Card className="overflow-hidden rounded-lg">
        {loadingState ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : visits.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {statusFilter ? `No ${statusFilter.replace("_", " ")} visits` : "No visits yet."}
            {!statusFilter && " "}
            {!statusFilter && <Link href="/visitors/invite" className="text-primary hover:underline">Invite visitor</Link>}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted-bg/50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Visitor</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Phone</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase hidden sm:table-cell">Purpose</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase hidden md:table-cell">Date</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {visits.map((v) => (
                <tr key={v.id} className="hover:bg-muted-bg/30">
                  <td className="px-3 py-2 text-sm font-medium text-foreground">{v.visitor_name}</td>
                  <td className="px-3 py-2 text-sm text-muted">{v.visitor_phone}</td>
                  <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor(v.status)}`}>{v.status.replace("_", " ")}</span></td>
                  <td className="px-3 py-2 text-sm text-muted hidden sm:table-cell">{v.purpose || "—"}</td>
                  <td className="px-3 py-2 text-xs text-muted hidden md:table-cell">{new Date(v.created_at).toLocaleString()}</td>
                  <td className="px-3 py-2">
                    {v.status === "pending" && canInviteVisitor(user) && (
                      <button onClick={() => approveMutation.mutate(v.id)} disabled={approvingId === v.id} className="px-2 py-1 bg-primary text-white text-xs font-medium rounded hover:bg-primary-hover disabled:opacity-50">
                        {approvingId === v.id ? "…" : "Approve"}
                      </button>
                    )}
                    {v.status === "approved" && v.otp && <span className="text-xs text-muted">OTP: {v.otp}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
