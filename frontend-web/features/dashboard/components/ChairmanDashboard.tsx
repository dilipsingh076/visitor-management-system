"use client";

import { useMemo } from "react";
import Link from "next/link";
import { downloadBlob } from "@/lib/api";
import { Avatar, Badge, Button, Card, CardContent, CardHeader, Tabs, TabsList, TabsTrigger, TabsContent, StatCard, StatCardSkeleton } from "@/components/ui";
import type { User } from "@/lib/auth";
import { getRoleResponsibility, canAccessSocietyManagement } from "@/lib/auth";
import { useDashboardStats, useRecentVisits } from "../hooks/useDashboardData";
import { theme } from "@/lib/theme";

/** AGM due date per MCS Act (India) — by 14 Aug every year */
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
  const statsQ = useDashboardStats(true);
  const visitsQ = useRecentVisits({ enabled: true, limit: 10 });

  const loading = statsQ.isLoading || visitsQ.isLoading;
  const stats = statsQ.data;
  const showManagement = canAccessSocietyManagement(user);
  const agmStatus = getAgmStatus();

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
        <h1 className={theme.text.heading2}>Chairman · Society oversight</h1>
        <p className={theme.text.subtitle}>
          {getRoleResponsibility("chairman")} · {user.username}
        </p>
      </div>

      <section>
        <h2 className={`${theme.text.muted} mb-3`}>Governance &amp; management</h2>
        <div className="flex flex-wrap gap-2">
          {showManagement && (
            <Link href="/admin/users">
              <Button size="sm" variant="primary">Manage users &amp; committee</Button>
            </Link>
          )}
          <Link href="/visitors"><Button size="sm" variant="secondary">Visitors</Button></Link>
          <Link href="/guard"><Button size="sm" variant="secondary">Guard view</Button></Link>
          <Link href="/blacklist"><Button size="sm" variant="secondary">Blacklist</Button></Link>
          <Button variant="outline" size="sm" onClick={() => handleExportMuster("daily")}>
            Export muster
          </Button>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="outlined" className="overflow-hidden">
          <CardHeader className={`${theme.surface.cardHeader} py-3`}>
            <span className={theme.sectionTitle}>Key dates</span>
          </CardHeader>
          <CardContent className={`py-4 ${theme.space.formStack}`}>
            <p className={theme.text.muted}>{agmStatus.label}</p>
            <p className={theme.text.mutedSmall}>
              Monthly MC meetings and society settings can be added here when available.
            </p>
          </CardContent>
        </Card>

        <section>
          <h2 className={`${theme.text.muted} mb-3`}>Today at a glance</h2>
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Visitors today" value={stats?.visitors_today ?? 0} />
            <StatCard label="Pending approval" value={stats?.pending_approvals ?? 0} variant="warning" />
            <StatCard label="Currently inside" value={stats?.checked_in ?? 0} variant="success" />
          </div>
        </section>
      </div>

      <section>
        <Tabs defaultValue="activity">
          <TabsList className="p-1 h-10">
            <TabsTrigger value="activity" className="text-sm px-4 py-2">Recent visitor activity</TabsTrigger>
            <TabsTrigger value="reports" className="text-sm px-4 py-2">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="mt-4">
            <Card variant="outlined" className="overflow-hidden">
              <CardHeader className={`${theme.surface.cardHeader} py-3`}>
                <span className={theme.sectionTitle}>Latest activity</span>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border max-h-60 overflow-y-auto">
                  {recentActivity.length === 0 ? (
                    <div className={`px-4 py-6 text-center ${theme.text.muted}`}>No recent activity</div>
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
          </TabsContent>

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
        </Tabs>
      </section>
    </div>
  );
}
