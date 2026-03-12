"use client";

import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Avatar, Badge, Button, Card, CardContent, CardHeader, StatCard, StatCardSkeleton } from "@/components/ui";
import type { User } from "@/lib/auth";
import { getPrimaryRole, getRoleResponsibility } from "@/lib/auth";
import { useDashboardMyRequests, useDashboardStats } from "../hooks/useDashboardData";
import { dashboardKeys } from "../hooks/keys";
import { useFrequentVisitors, useUnreadNotifications, useMarkNotificationRead, useApproveVisit, useRejectVisit } from "@/features/visitors";
import { theme } from "@/lib/theme";

interface ResidentDashboardProps {
  user: User;
}

export function ResidentDashboard({ user }: ResidentDashboardProps) {
  const queryClient = useQueryClient();
  const statsQ = useDashboardStats(true);
  const myReqQ = useDashboardMyRequests(true);
  const frequentQ = useFrequentVisitors(true);
  const notificationsQ = useUnreadNotifications(true);
  const markReadMutation = useMarkNotificationRead();
  const approveMutation = useApproveVisit();
  const rejectMutation = useRejectVisit();

  const stats = statsQ.data;
  const pending = myReqQ.data?.visits ?? [];
  const frequent = (frequentQ.data ?? []).slice(0, 6);
  const notifications = notificationsQ.data ?? [];
  const loading = statsQ.isLoading || myReqQ.isLoading || frequentQ.isLoading;

  const approvingId = approveMutation.isPending ? (approveMutation.variables as string) : null;
  const rejectingId = rejectMutation.isPending ? (rejectMutation.variables as string) : null;

  const handleApprove = async (visitId: string) => {
    await approveMutation.mutateAsync(visitId);
    queryClient.invalidateQueries({ queryKey: dashboardKeys.myRequests() });
  };

  const handleReject = async (visitId: string) => {
    await rejectMutation.mutateAsync(visitId);
    queryClient.invalidateQueries({ queryKey: dashboardKeys.myRequests() });
  };

  const handleDismissNotification = (id: string) => markReadMutation.mutate(id);

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
        <h1 className={theme.text.heading2}>Welcome home</h1>
        <p className={theme.text.subtitle}>
          {user.username} · {getRoleResponsibility(getPrimaryRole(user))}
        </p>
      </div>

      <section>
        <h2 className={`${theme.text.muted} mb-3`}>Quick actions</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/visitors/invite"><Button size="sm">Invite visitor</Button></Link>
          <Link href="/visitors"><Button size="sm" variant="secondary">My visitors</Button></Link>
          <Link href="/visitors/frequent"><Button size="sm" variant="secondary">Frequent</Button></Link>
        </div>
      </section>

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
                      <p className={`${theme.text.body} font-medium text-foreground truncate`}>{n.title}</p>
                      <p className={`${theme.text.mutedSmall} truncate`}>{n.body}</p>
                    </div>
                    <Button size="xs" variant="secondary" onClick={() => handleDismissNotification(n.id)} disabled={markReadMutation.isPending}>
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
        <h2 className={`${theme.text.muted} mb-3`}>Today at a glance</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Visitors today" value={stats?.visitors_today ?? 0} />
          <StatCard label="Pending approvals" value={stats?.pending_approvals ?? pending.length} variant="warning" />
          <StatCard label="Currently inside" value={stats?.checked_in ?? 0} variant="success" />
          <StatCard label="My requests" value={myReqQ.data?.count ?? pending.length} variant="primary" />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending approvals */}
        <Card variant="outlined" className="overflow-hidden">
          <CardHeader className={`${theme.surface.cardHeader} py-3`}>
            <span className={theme.sectionTitle}>Pending approvals ({pending.length})</span>
          </CardHeader>
          <CardContent className="p-0">
          {pending.length === 0 ? (
            <div className={`px-4 py-10 text-center ${theme.text.muted}`}>
              No approvals pending. When someone arrives for you, they’ll appear here.
            </div>
          ) : (
            <div className="divide-y divide-border max-h-64 overflow-y-auto">
              {pending.map((v) => (
                <div key={v.id} className="px-4 py-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex items-center gap-3">
                    <Avatar name={v.visitor_name} size="sm" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className={`${theme.text.body} font-medium text-foreground truncate`}>{v.visitor_name}</p>
                        {v.is_walkin && <Badge variant="default" className="text-xs shrink-0">Walk-in</Badge>}
                      </div>
                      <p className={`${theme.text.mutedSmall} truncate`}>{v.purpose || "Visit"} {v.visitor_phone ? `· ${v.visitor_phone}` : ""}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="xs" onClick={() => handleApprove(v.id)} loading={approvingId === v.id} disabled={approvingId === v.id || rejectingId === v.id}>Approve</Button>
                    <Button size="xs" variant="secondary" onClick={() => handleReject(v.id)} loading={rejectingId === v.id} disabled={approvingId === v.id || rejectingId === v.id}>Reject</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          </CardContent>
        </Card>

        {/* Frequent visitors */}
        <Card variant="outlined" className="overflow-hidden">
          <CardHeader
            className={`${theme.surface.cardHeader} py-3`}
            action={<Link href="/visitors/frequent" className={`${theme.text.mutedSmall} text-primary hover:underline`}>View all</Link>}
          >
            <span className={theme.sectionTitle}>Frequent visitors</span>
          </CardHeader>
          <CardContent className="p-0">
          {frequent.length === 0 ? (
            <div className={`px-4 py-10 text-center ${theme.text.muted}`}>
              No frequent visitors yet.{" "}
              <Link href="/visitors/invite" className="text-primary hover:underline">Invite someone</Link>.
            </div>
          ) : (
            <div className="divide-y divide-border max-h-64 overflow-y-auto">
              {frequent.map((fv) => (
                <div key={fv.id} className="px-4 py-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex items-center gap-3">
                    <Avatar name={fv.name} size="sm" />
                    <div className="min-w-0">
                      <p className={`${theme.text.body} font-medium text-foreground truncate`}>{fv.name}</p>
                      <p className={`${theme.text.mutedSmall} truncate`}>{fv.visit_count} visits · {fv.last_visit ?? "—"}</p>
                    </div>
                  </div>
                  <Link href={`/visitors/invite?name=${encodeURIComponent(fv.name)}&phone=${encodeURIComponent(fv.phone)}&purpose=${encodeURIComponent(fv.purpose)}`}>
                    <Button size="xs" variant="secondary">Invite</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
