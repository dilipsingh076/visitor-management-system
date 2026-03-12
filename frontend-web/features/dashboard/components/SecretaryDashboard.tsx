"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { downloadBlob } from "@/lib/api";
import { Avatar, Badge, Button, Card, CardContent, CardHeader, StatCard, StatCardSkeleton } from "@/components/ui";
import type { User } from "@/lib/auth";
import { getRoleResponsibility } from "@/lib/auth";
import { useDashboardStats, useRecentVisits } from "../hooks/useDashboardData";
import { dashboardKeys } from "../hooks/keys";
import { useVisitorsList, useApproveVisit, useRejectVisit, useUnreadNotifications, useMarkNotificationRead, visitorsKeys } from "@/features/visitors";
import { theme } from "@/lib/theme";

interface SecretaryDashboardProps {
  user: User;
}

const getActionBadge = (action: string) => {
  const variants: Record<string, { variant: "success" | "warning" | "info" | "default" | "error"; label: string }> = {
    checked_in: { variant: "success", label: "In" },
    checked_out: { variant: "default", label: "Out" },
    invited: { variant: "info", label: "Invited" },
    approved: { variant: "success", label: "OK" },
    rejected: { variant: "error", label: "No" },
    registered: { variant: "warning", label: "Walk-in" },
  };
  const config = variants[action] || { variant: "default" as const, label: action };
  return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
};

export function SecretaryDashboard({ user }: SecretaryDashboardProps) {
  const queryClient = useQueryClient();
  const statsQ = useDashboardStats(true);
  const visitsQ = useRecentVisits({ enabled: true, limit: 15 });
  const pendingQ = useVisitorsList({ status: "pending", scope: "all", enabled: true });

  const approveMutation = useApproveVisit();
  const rejectMutation = useRejectVisit();
  const approvingId = approveMutation.isPending ? (approveMutation.variables as string) : null;
  const rejectingId = rejectMutation.isPending ? (rejectMutation.variables as string) : null;

  const stats = statsQ.data;
  const pendingList = pendingQ.data ?? [];
  const notificationsQ = useUnreadNotifications(true);
  const notifications = notificationsQ.data ?? [];
  const markReadMutation = useMarkNotificationRead();
  const loading = statsQ.isLoading || visitsQ.isLoading || pendingQ.isLoading;

  const recentActivity = useMemo(() => {
    const visits = visitsQ.data ?? [];
    return visits.map((v) => ({
      id: v.id,
      visitor_name: v.visitor_name,
      action: v.status,
      timestamp: v.created_at,
      performed_by: v.host_name || "—",
    }));
  }, [visitsQ.data]);

  const handleApprove = async (visitId: string) => {
    await approveMutation.mutateAsync(visitId);
    queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() });
    queryClient.invalidateQueries({ queryKey: visitorsKeys.all });
  };

  const handleReject = async (visitId: string) => {
    await rejectMutation.mutateAsync(visitId);
    queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() });
    queryClient.invalidateQueries({ queryKey: visitorsKeys.all });
  };

  const handleExportMuster = async (type: string) => {
    const filename = `${type}-muster-${new Date().toISOString().split("T")[0]}.csv`;
    await downloadBlob("/dashboard/muster?format=csv", filename);
  };

  if (loading) {
    return (
      <div className={theme.loading.page}>
        <div className={theme.loading.line} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className={theme.text.heading2}>Secretary · Day-to-day operations</h1>
        <p className={theme.text.subtitle}>
          {getRoleResponsibility("secretary")} · {user.username}
        </p>
      </div>

      {notifications.length > 0 && (
        <section>
          <Card variant="outlined" className="overflow-hidden border-primary/30 bg-primary/5">
            <CardHeader className={`${theme.surface.cardHeader} py-2.5 flex flex-row items-center justify-between`}>
              <span className={theme.sectionTitle}>Visitor alerts</span>
              <Link href="/visitors" className={`${theme.text.mutedSmall} font-medium text-primary hover:underline`}>View & act</Link>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-border">
                {notifications.slice(0, 5).map((n) => (
                  <li key={n.id} className="px-3 py-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{n.body}</p>
                    </div>
                    <Button size="xs" variant="secondary" onClick={() => markReadMutation.mutate(n.id)} disabled={markReadMutation.isPending}>
                      Dismiss
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}

      <section>
        <h2 className={`${theme.text.muted} mb-3`}>Quick actions</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/visitors/invite"><Button size="sm" variant="primary">Invite visitor</Button></Link>
          <Link href="/visitors"><Button size="sm" variant="secondary">All visitors</Button></Link>
          <Link href="/checkin"><Button size="sm" variant="secondary">Check-in</Button></Link>
          <Link href="/checkin/walkin"><Button size="sm" variant="secondary">Walk-in</Button></Link>
          <Link href="/guard"><Button size="sm" variant="secondary">Guard view</Button></Link>
          <Link href="/blacklist"><Button size="sm" variant="secondary">Blacklist</Button></Link>
          <Button variant="outline" size="sm" onClick={() => handleExportMuster("daily")}>
            Export muster
          </Button>
        </div>
      </section>

      <section>
        <h2 className={`${theme.text.muted} mb-3`}>Today at a glance</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Pending approval" value={stats?.pending_approvals ?? pendingList.length} variant="warning" />
          <StatCard label="Visitors today" value={stats?.visitors_today ?? 0} />
          <StatCard label="Currently inside" value={stats?.checked_in ?? 0} variant="success" />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="outlined" className="overflow-hidden">
          <CardHeader className={`${theme.surface.cardHeader} py-3 flex flex-row items-center justify-between`}>
            <span className={theme.sectionTitle}>Pending approvals ({pendingList.length})</span>
            <Link href="/visitors?status=pending" className={`${theme.text.mutedSmall} text-primary hover:underline`}>View all</Link>
          </CardHeader>
          <CardContent className="p-0">
            {pendingList.length === 0 ? (
              <div className={`px-4 py-8 text-center ${theme.text.muted}`}>
                No pending approvals. Walk-ins and invites will appear here.
              </div>
            ) : (
              <div className="divide-y divide-border max-h-72 overflow-y-auto">
                {pendingList.slice(0, 10).map((v) => (
                  <div key={v.id} className="px-4 py-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex items-center gap-3">
                      <Avatar name={v.visitor_name} size="sm" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className={`${theme.text.body} font-medium text-foreground truncate`}>{v.visitor_name}</p>
                          {v.is_walkin && (
                            <Badge variant="default" className="text-xs shrink-0">Walk-in</Badge>
                          )}
                        </div>
                        <p className={`${theme.text.mutedSmall} truncate`}>
                          {v.purpose || "Visit"} · {v.host_name ?? "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="xs"
                        onClick={() => handleApprove(v.id)}
                        loading={approvingId === v.id}
                        disabled={approvingId === v.id || rejectingId === v.id}
                      >
                        Approve
                      </Button>
                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={() => handleReject(v.id)}
                        loading={rejectingId === v.id}
                        disabled={approvingId === v.id || rejectingId === v.id}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card variant="outlined" className="overflow-hidden">
          <CardHeader className="border-b border-border py-3">
            <span className="text-sm font-semibold text-foreground">Recent visitor activity</span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border max-h-72 overflow-y-auto">
              {recentActivity.length === 0 ? (
                <div className={`px-4 py-8 text-center ${theme.text.muted}`}>No recent activity</div>
              ) : (
                recentActivity.map((a) => (
                  <div key={a.id} className="px-4 py-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={a.visitor_name} size="sm" />
                      <div className="min-w-0">
                        <p className={`${theme.text.body} font-medium text-foreground truncate`}>{a.visitor_name}</p>
                        <p className={`${theme.text.mutedSmall} truncate`}>
                          {new Date(a.timestamp).toLocaleString()} · {a.performed_by}
                        </p>
                      </div>
                    </div>
                    {getActionBadge(a.action)}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <section>
        <Card variant="outlined">
          <CardHeader className={`${theme.surface.cardHeader} py-3`}>
            <span className={theme.sectionTitle}>Export reports</span>
          </CardHeader>
          <CardContent className="py-4">
            <p className={`${theme.text.muted} mb-4`}>Download muster (CSV) for records and meetings.</p>
            <div className="flex gap-2 flex-wrap">
              <Button variant="secondary" size="sm" onClick={() => handleExportMuster("daily")}>Daily</Button>
              <Button variant="secondary" size="sm" onClick={() => handleExportMuster("weekly")}>Weekly</Button>
              <Button variant="secondary" size="sm" onClick={() => handleExportMuster("monthly")}>Monthly</Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
