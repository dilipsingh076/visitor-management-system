"use client";

import { useSearchParams } from "next/navigation";
import { canInviteVisitor, getPrimaryRole } from "@/lib/auth";
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
  const notificationsQ = useUnreadNotifications(Boolean(user) && (role === "resident" || role === "admin"));
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title="Visitors"
        description={canInviteVisitor(user) ? "Manage visits. Pending invites need your approval before visitor can check in." : "View visits. Guards see all; residents see their own."}
        action={canInviteVisitor(user) ? <LinkButton href="/visitors/invite" variant="primary" size="md">+ Invite Visitor</LinkButton> : undefined}
      />
      {notifications.length > 0 && (
        <div className="mb-6 space-y-2">
          {notifications.map((n) => (
            <div key={n.id} className="flex items-center justify-between p-4 bg-success-light border border-success/30 rounded-xl">
              <div>
                <p className="font-medium text-success">{n.title}</p>
                <p className="text-sm text-muted">{n.body}</p>
                <p className="text-xs text-muted mt-1">{new Date(n.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => markReadMutation.mutate(n.id)} disabled={markReadMutation.isPending} className="px-3 py-1.5 text-sm bg-success text-white rounded-lg hover:bg-green-700">
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2 mb-6">
        <Link href="/visitors" className={`px-4 py-2 rounded-lg text-sm font-medium ${!statusFilter ? "bg-border text-foreground" : "bg-muted-bg text-muted hover:bg-border"}`}>All</Link>
        <Link href="/visitors?status=pending" className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === "pending" ? "bg-warning-light text-warning" : "bg-muted-bg text-muted hover:bg-border"}`}>Pending approval</Link>
        <Link href="/visitors?status=approved" className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === "approved" ? "bg-info-light text-info" : "bg-muted-bg text-muted hover:bg-border"}`}>Approved</Link>
        <Link href="/visitors?status=checked_in" className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === "checked_in" ? "bg-primary-light text-primary" : "bg-muted-bg text-muted hover:bg-border"}`}>Checked in</Link>
      </div>
      <Card className="overflow-hidden">
        {loadingState ? (
          <div className="p-12 text-center text-muted-foreground">Loading...</div>
        ) : visits.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground mb-4">{statusFilter ? `No ${statusFilter.replace("_", " ")} visits` : "No visits yet"}</p>
            {!statusFilter && <Link href="/visitors/invite" className="text-primary hover:underline">Invite your first visitor</Link>}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Visitor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Purpose</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visits.map((v) => (
                <tr key={v.id} className="hover:bg-background">
                  <td className="px-6 py-4 font-medium text-foreground">{v.visitor_name}</td>
                  <td className="px-6 py-4 text-muted">{v.visitor_phone}</td>
                  <td><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(v.status)}`}>{v.status.replace("_", " ")}</span></td>
                  <td className="px-6 py-4 text-muted">{v.purpose || "-"}</td>
                  <td className="px-6 py-4 text-muted">{new Date(v.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    {v.status === "pending" && canInviteVisitor(user) && (
                      <button onClick={() => approveMutation.mutate(v.id)} disabled={approvingId === v.id} className="px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover disabled:opacity-50">
                        {approvingId === v.id ? "..." : "Approve"}
                      </button>
                    )}
                    {v.status === "approved" && v.otp && <span className="text-xs text-muted-foreground">OTP: {v.otp}</span>}
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
