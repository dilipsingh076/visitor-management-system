"use client";

import { useMemo } from "react";
import Link from "next/link";
import { downloadBlob } from "@/lib/api";
import { Avatar, Badge, Button, Card, CardContent, CardHeader, StatCard, StatCardSkeleton } from "@/components/ui";
import type { User } from "@/lib/auth";
import { getRoleResponsibility, canAccessSocietyManagement } from "@/lib/auth";
import { useDashboardStats, useRecentVisits } from "../hooks/useDashboardData";
import { useGuardBlacklist } from "@/features/guard";
import { theme } from "@/lib/theme";

interface TreasurerDashboardProps {
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

export function TreasurerDashboard({ user }: TreasurerDashboardProps) {
  const statsQ = useDashboardStats(true);
  const visitsQ = useRecentVisits({ enabled: true, limit: 10 });
  const blacklistQ = useGuardBlacklist();

  const loading = statsQ.isLoading || visitsQ.isLoading || blacklistQ.isLoading;
  const stats = statsQ.data;
  const showManagement = canAccessSocietyManagement(user);
  const blacklist = blacklistQ.data ?? [];

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
        <h1 className={theme.text.heading2}>Treasurer · Society oversight</h1>
        <p className={theme.text.subtitle}>
          {getRoleResponsibility("treasurer")} · {user.username}
        </p>
      </div>

      <section>
        <h2 className={`${theme.text.muted} mb-3`}>Oversight &amp; reports</h2>
        <div className="flex flex-wrap gap-2">
          {showManagement && (
            <Button variant="outline" size="sm" onClick={() => handleExportMuster("daily")}>
              Export daily muster (CSV)
            </Button>
          )}
        </div>
      </section>

      <section>
        <h2 className={`${theme.text.muted} mb-3`}>Today at a glance</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Visitors today" value={stats?.visitors_today ?? 0} />
          <StatCard label="Pending approval" value={stats?.pending_approvals ?? 0} variant="warning" />
          <StatCard label="Currently inside" value={stats?.checked_in ?? 0} variant="success" />
          <StatCard label="Blacklisted" value={blacklist.length} variant="warning" />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="outlined" className="overflow-hidden">
          <CardHeader className={`${theme.surface.cardHeader} py-3 flex flex-row items-center justify-between`}>
            <span className={theme.sectionTitle}>Blacklist ({blacklist.length})</span>
          </CardHeader>
          <CardContent className="p-0">
            {blacklist.length === 0 ? (
              <div className={`px-4 py-8 text-center ${theme.text.muted}`}>No blacklisted entries</div>
            ) : (
              <div className="divide-y divide-border max-h-60 overflow-y-auto">
                {blacklist.slice(0, 8).map((b) => (
                  <div key={b.visitor_id} className="px-4 py-2.5 flex items-center gap-3 min-w-0">
                    <Avatar name={b.visitor_name} size="sm" />
                    <div className="min-w-0">
                      <p className={`${theme.text.body} font-medium text-foreground truncate`}>{b.visitor_name}</p>
                      <p className={`${theme.text.mutedSmall} truncate`}>{b.visitor_phone} · {b.reason || "—"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card variant="outlined" className="overflow-hidden">
          <CardHeader className={`${theme.surface.cardHeader} py-3`}>
            <span className={theme.sectionTitle}>Recent visitor activity</span>
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
      </div>

      <section>
        <Card variant="outlined">
          <CardHeader className={`${theme.surface.cardHeader} py-3`}>
            <span className={theme.sectionTitle}>Export reports</span>
          </CardHeader>
          <CardContent className="py-4">
            <p className={`${theme.text.muted} mb-4`}>
              Muster (CSV) for records. Maintenance and audit modules can be added when available.
            </p>
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
