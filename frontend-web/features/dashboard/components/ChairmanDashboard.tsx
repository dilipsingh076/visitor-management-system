"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { downloadBlob } from "@/lib/api";
import { Avatar, Badge, Button, Card, CardContent, CardHeader, Tabs, TabsList, TabsTrigger, TabsContent, StatCard, StatCardSkeleton } from "@/components/ui";
import type { User } from "@/lib/auth";
import { getRoleResponsibility, canAccessSocietyManagement } from "@/lib/auth";
import { useDashboardStats, useRecentVisits, useDashboardMyRequests } from "../hooks/useDashboardData";
import { dashboardKeys } from "../hooks/keys";
import {
  useVisitorsList,
  useApproveVisit,
  useRejectVisit,
  useUnreadNotifications,
  useMarkNotificationRead,
  useFrequentVisitors,
  visitorsKeys,
} from "@/features/visitors";
import { useResidents } from "@/features/residents/hooks/useResidents";
import { theme } from "@/lib/theme";

const AGM_DUE_MONTH = 8;
const AGM_DUE_DAY = 14;

interface ChairmanDashboardProps {
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
    pending: { variant: "warning", label: "Pending" },
  };
  const config = variants[action] || { variant: "default" as const, label: action };
  return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
};

function getAgmStatus(): { label: string; variant: "success" | "warning" | "default" } {
  const now = new Date();
  const currentYear = now.getFullYear();
  const agmDue = new Date(currentYear, AGM_DUE_MONTH - 1, AGM_DUE_DAY);
  if (now > agmDue) {
    return { label: `AGM for ${currentYear} was due by 14 Aug`, variant: "warning" };
  }
  const daysLeft = Math.ceil((agmDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return { label: `AGM due by 14 Aug ${currentYear} (${daysLeft} days)`, variant: daysLeft <= 30 ? "warning" : "default" };
}

export function ChairmanDashboard({ user }: ChairmanDashboardProps) {
  const queryClient = useQueryClient();
  const statsQ = useDashboardStats(true);
  const visitsQ = useRecentVisits({ enabled: true, limit: 10 });
  const pendingQ = useVisitorsList({ status: "pending", scope: "all", enabled: true });
  const myReqQ = useDashboardMyRequests(true);
  const frequentQ = useFrequentVisitors(true);
  const residentsQ = useResidents();
  const notificationsQ = useUnreadNotifications(true);
  const markReadMutation = useMarkNotificationRead();

  const approveMutation = useApproveVisit();
  const rejectMutation = useRejectVisit();
  const approvingId = approveMutation.isPending ? (approveMutation.variables as string) : null;
  const rejectingId = rejectMutation.isPending ? (rejectMutation.variables as string) : null;

  const loading = statsQ.isLoading || visitsQ.isLoading || pendingQ.isLoading;
  const stats = statsQ.data;
  const pendingList = pendingQ.data ?? [];
  const notifications = notificationsQ.data ?? [];
  const frequent = (frequentQ.data ?? []).slice(0, 4);
  const showManagement = canAccessSocietyManagement(user);
  const agmStatus = getAgmStatus();
  const residentsCount = residentsQ.data?.length ?? 0;

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={theme.text.heading2}>Chairman Dashboard</h1>
        <p className={theme.text.subtitle}>
          {getRoleResponsibility("chairman")} · {user.username}
        </p>
      </div>

      {/* Visitor Alerts */}
      {notifications.length > 0 && (
        <Card variant="outlined" className="overflow-hidden border-primary/30 bg-primary/5">
          <CardHeader className={`${theme.surface.cardHeader} py-2.5 flex flex-row items-center justify-between`}>
            <span className={theme.sectionTitle}>Visitor alerts</span>
            <Badge variant="warning">{notifications.length} new</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {notifications.slice(0, 4).map((n) => (
                <li key={n.id} className="px-4 py-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{n.body}</p>
                  </div>
                  <Button size="xs" variant="secondary" onClick={() => handleDismissNotification(n.id)} disabled={markReadMutation.isPending}>
                    Dismiss
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <section>
        <h2 className={`${theme.text.muted} mb-3 text-sm`}>Quick actions</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/visitors/invite"><Button size="sm" variant="primary">Invite visitor</Button></Link>
          <Link href="/visitors"><Button size="sm" variant="outline">View visitors</Button></Link>
          <Link href="/guard"><Button size="sm" variant="outline">Guard dashboard</Button></Link>
          <Link href="/blacklist"><Button size="sm" variant="outline">Blacklist</Button></Link>
          {showManagement && (
            <>
              <Link href="/admin/users"><Button size="sm" variant="outline">Manage users</Button></Link>
              <Link href="/admin/amenities"><Button size="sm" variant="outline">Amenities</Button></Link>
              <Link href="/admin/staff"><Button size="sm" variant="outline">Staff</Button></Link>
              <Button variant="outline" size="sm" onClick={() => handleExportMuster("daily")}>Export muster</Button>
            </>
          )}
        </div>
      </section>

      {/* Stats Grid */}
      <section>
        <h2 className={`${theme.text.muted} mb-3 text-sm`}>Today at a glance</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Visitors today" value={stats?.visitors_today ?? 0} />
          <StatCard label="Pending approval" value={stats?.pending_approvals ?? pendingList.length} variant="warning" />
          <StatCard label="Currently inside" value={stats?.checked_in ?? 0} variant="success" />
          <StatCard label="Total residents" value={residentsCount} variant="primary" />
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending Approvals */}
        <Card variant="outlined" className="overflow-hidden">
          <CardHeader className={`${theme.surface.cardHeader} py-3 flex flex-row items-center justify-between`}>
            <span className={theme.sectionTitle}>Pending approvals ({pendingList.length})</span>
            <Link href="/visitors?status=pending" className="text-xs text-primary hover:underline">View all</Link>
          </CardHeader>
          <CardContent className="p-0">
            {pendingList.length === 0 ? (
              <div className={`px-4 py-8 text-center ${theme.text.muted}`}>
                No pending approvals. Walk-ins and invites will appear here.
              </div>
            ) : (
              <div className="divide-y divide-border max-h-64 overflow-y-auto">
                {pendingList.slice(0, 8).map((v) => (
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

        {/* Recent Activity */}
        <Card variant="outlined" className="overflow-hidden">
          <CardHeader className={`${theme.surface.cardHeader} py-3 flex flex-row items-center justify-between`}>
            <span className={theme.sectionTitle}>Recent activity</span>
            <Link href="/visitors" className="text-xs text-primary hover:underline">View all</Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border max-h-64 overflow-y-auto">
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

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Frequent Visitors */}
        <Card variant="outlined" className="overflow-hidden">
          <CardHeader
            className={`${theme.surface.cardHeader} py-3`}
            action={<Link href="/visitors/frequent" className="text-xs text-primary hover:underline">View all</Link>}
          >
            <span className={theme.sectionTitle}>Frequent visitors</span>
          </CardHeader>
          <CardContent className="p-0">
            {frequent.length === 0 ? (
              <div className={`px-4 py-8 text-center ${theme.text.muted}`}>
                No frequent visitors yet.{" "}
                <Link href="/visitors/invite" className="text-primary hover:underline">Invite someone</Link>.
              </div>
            ) : (
              <div className="divide-y divide-border">
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

        {/* Key Dates & Governance */}
        <Card variant="outlined" className="overflow-hidden">
          <CardHeader className={`${theme.surface.cardHeader} py-3`}>
            <span className={theme.sectionTitle}>Governance & Key Dates</span>
          </CardHeader>
          <CardContent className="py-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${agmStatus.variant === "warning" ? "bg-warning/10 text-warning" : "bg-muted-bg text-muted-foreground"}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{agmStatus.label}</p>
                <p className="text-xs text-muted-foreground">Annual General Meeting as per MCS Act</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-primary/10 text-primary">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Managing Committee</p>
                <p className="text-xs text-muted-foreground">Monthly meetings and society operations</p>
              </div>
            </div>
            <Link href="/admin/users" className="block">
              <Button variant="outline" size="sm" className="w-full">
                Manage Society Members
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Reports Section */}
      <section>
        <Tabs defaultValue="reports">
          <TabsList className="p-1 h-10">
            <TabsTrigger value="reports" className="text-sm px-4 py-2">Reports & Export</TabsTrigger>
            <TabsTrigger value="overview" className="text-sm px-4 py-2">Society Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="mt-4">
            <Card variant="outlined">
              <CardHeader className={`${theme.surface.cardHeader} py-3`}>
                <span className={theme.sectionTitle}>Export reports</span>
              </CardHeader>
              <CardContent className="py-4">
                <p className={`${theme.text.muted} mb-4`}>Download muster (CSV) for audit and records.</p>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="secondary" size="sm" onClick={() => handleExportMuster("daily")}>Daily</Button>
                  <Button variant="secondary" size="sm" onClick={() => handleExportMuster("weekly")}>Weekly</Button>
                  <Button variant="secondary" size="sm" onClick={() => handleExportMuster("monthly")}>Monthly</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="mt-4">
            <Card variant="outlined">
              <CardHeader className={`${theme.surface.cardHeader} py-3`}>
                <span className={theme.sectionTitle}>Society Statistics</span>
              </CardHeader>
              <CardContent className="py-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted-bg/50">
                    <p className="text-2xl font-bold text-foreground">{residentsCount}</p>
                    <p className="text-xs text-muted-foreground">Total Residents</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted-bg/50">
                    <p className="text-2xl font-bold text-foreground">{stats?.visitors_today ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Today's Visitors</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted-bg/50">
                    <p className="text-2xl font-bold text-foreground">{stats?.checked_in ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Inside Now</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted-bg/50">
                    <p className="text-2xl font-bold text-foreground">{pendingList.length}</p>
                    <p className="text-xs text-muted-foreground">Pending Approvals</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href="/admin/users"><Button variant="outline" size="sm">Manage Users</Button></Link>
                  <Link href="/admin/amenities"><Button variant="outline" size="sm">Amenities</Button></Link>
                  <Link href="/admin/staff"><Button variant="outline" size="sm">Staff</Button></Link>
                  <Link href="/visitors"><Button variant="outline" size="sm">View All Visitors</Button></Link>
                  <Link href="/blacklist"><Button variant="outline" size="sm">View Blacklist</Button></Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
