"use client";

import { useMemo } from "react";
import Link from "next/link";
import { downloadBlob } from "@/lib/api";
import { Avatar, Badge, Button, Card, CardContent, CardHeader, Tabs, TabsList, TabsTrigger, TabsContent, StatCard, StatCardSkeleton } from "@/components/ui";
import type { User } from "@/lib/auth";
import { getPrimaryRole, ROLE_LABELS, getRoleResponsibility, canAccessSocietyManagement } from "@/lib/auth";
import { useDashboardStats, useRecentVisits } from "../hooks/useDashboardData";

interface AdminDashboardProps {
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

export function AdminDashboard({ user }: AdminDashboardProps) {
  const statsQ = useDashboardStats(true);
  const visitsQ = useRecentVisits({ enabled: true, limit: 15 });

  const loading = statsQ.isLoading || visitsQ.isLoading;

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

  const handleExportReport = async (type: string) => {
    const filename = `${type}-report-${new Date().toISOString().split("T")[0]}.csv`;
    await downloadBlob("/dashboard/muster?format=csv", filename);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-9 bg-muted-bg rounded-lg w-56 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </div>
    );
  }

  const stats = statsQ.data;
  const role = getPrimaryRole(user);
  const roleLabel = ROLE_LABELS[role] ?? role;
  const showManagement = canAccessSocietyManagement(user);

  const quickActions = [
    ...(showManagement ? [{ href: "/admin/users", label: "Manage users", primary: true }] : []),
    { href: "/visitors", label: "Visitors" },
    { href: "/checkin", label: "Check-in" },
    { href: "/checkin/walkin", label: "Walk-in" },
    { href: "/guard", label: "Guard view" },
    { href: "/blacklist", label: "Blacklist" },
  ] as { href: string; label: string; primary?: boolean }[];

  return (
    <div className="space-y-8">
      {/* Welcome + role */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Society overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {roleLabel} · {getRoleResponsibility(role)} · {user.username}
        </p>
      </div>

      {/* Quick actions — all features visible, not only check-in/walk-in */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Quick actions</h2>
        <div className="flex flex-wrap gap-2">
          {quickActions.map(({ href, label, primary }) => (
            <Link key={href} href={href}>
              <Button size="sm" variant={primary ? "primary" : "secondary"}>
                {label}
              </Button>
            </Link>
          ))}
          <Button variant="outline" size="sm" onClick={() => handleExportReport("daily")}>
            Export muster
          </Button>
        </div>
      </section>

      {/* Stats */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Today at a glance</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Visitors today" value={stats?.visitors_today ?? 0} />
          <StatCard label="Pending approval" value={stats?.pending_approvals ?? 0} variant="warning" />
          <StatCard label="Currently inside" value={stats?.checked_in ?? 0} variant="success" />
          <StatCard label="You" value={<span className="truncate block max-w-full" title={user.username}>{user.username}</span>} />
        </div>
      </section>

      {/* Activity & Reports */}
      <section>
        <Tabs defaultValue="activity">
          <TabsList className="p-1 h-10">
            <TabsTrigger value="activity" className="text-sm px-4 py-2">Recent activity</TabsTrigger>
            <TabsTrigger value="reports" className="text-sm px-4 py-2">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="mt-4">
            <Card variant="outlined" className="overflow-hidden">
              <CardHeader className="border-b border-border py-3">
                <span className="text-sm font-semibold text-foreground">Latest visitor activity</span>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border max-h-72 overflow-y-auto">
                  {recentActivity.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">No recent activity</div>
                  ) : (
                    recentActivity.map((a) => (
                      <div key={a.id} className="px-4 py-2.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar name={a.visitor_name} size="sm" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{a.visitor_name}</p>
                            <p className="text-xs text-muted-foreground truncate">
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
          </TabsContent>

          <TabsContent value="reports" className="mt-4">
            <Card variant="outlined">
              <CardHeader className="border-b border-border py-3">
                <span className="text-sm font-semibold text-foreground">Export reports</span>
              </CardHeader>
              <CardContent className="py-4">
                <p className="text-sm text-muted-foreground mb-4">Download muster (CSV) for the selected period.</p>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="secondary" size="sm" onClick={() => handleExportReport("daily")}>Daily</Button>
                  <Button variant="secondary" size="sm" onClick={() => handleExportReport("weekly")}>Weekly</Button>
                  <Button variant="secondary" size="sm" onClick={() => handleExportReport("monthly")}>Monthly</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
