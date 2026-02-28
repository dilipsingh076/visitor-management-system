"use client";

import { useMemo } from "react";
import Link from "next/link";
import { downloadBlob } from "@/lib/api";
import { Avatar, Badge, Button, Tabs, TabsList, TabsTrigger, TabsContent, StatCardSkeleton } from "@/components/ui";
import type { User } from "@/lib/auth";
import { useDashboardStats, useRecentVisits } from "../hooks/useDashboardData";

interface AdminDashboardProps {
  user: User;
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const statsQ = useDashboardStats(true);
  const visitsQ = useRecentVisits({ enabled: true, limit: 20 });

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

  const getActionBadge = (action: string) => {
    const variants: Record<
      string,
      { variant: "success" | "warning" | "info" | "default" | "error"; label: string }
    > = {
      checked_in: { variant: "success", label: "Checked In" },
      checked_out: { variant: "default", label: "Checked Out" },
      invited: { variant: "info", label: "Invited" },
      approved: { variant: "success", label: "Approved" },
      rejected: { variant: "error", label: "Rejected" },
      registered: { variant: "warning", label: "Walk-in" },
    };
    const config = variants[action] || { variant: "default" as const, label: action };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleExportReport = async (type: string) => {
    const filename = `${type}-report-${new Date().toISOString().split("T")[0]}.csv`;
    await downloadBlob("/dashboard/muster?format=csv", filename);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </div>
    );
  }

  const stats = statsQ.data;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and management</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" onClick={() => handleExportReport("daily")}>
            Export Report
          </Button>
          <Link href="/admin/users">
            <Button>Manage Users</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-muted-foreground text-sm">Total Today</p>
          <p className="text-2xl font-bold text-foreground mt-1">{stats?.visitors_today ?? 0}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-muted-foreground text-sm">Pending Approvals</p>
          <p className="text-2xl font-bold text-warning mt-1">{stats?.pending_approvals ?? 0}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-muted-foreground text-sm">Currently Inside</p>
          <p className="text-2xl font-bold text-success mt-1">{stats?.checked_in ?? 0}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-muted-foreground text-sm">Welcome</p>
          <p className="text-lg font-semibold text-primary mt-1">{user.username}</p>
        </div>
      </div>

      <Tabs defaultValue="activity">
        <TabsList>
          <TabsTrigger value="activity">Recent activity</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="divide-y divide-border">
              {recentActivity.map((a) => (
                <div key={a.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={a.visitor_name} size="md" />
                    <div>
                      <p className="font-medium text-foreground">{a.visitor_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(a.timestamp).toLocaleString()} · {a.performed_by}
                      </p>
                    </div>
                  </div>
                  {getActionBadge(a.action)}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <div className="bg-card rounded-xl border border-border p-6">
            <p className="text-muted-foreground mb-4">
              Export CSV for compliance and operations.
            </p>
            <div className="flex gap-2 flex-wrap">
              <Button variant="secondary" onClick={() => handleExportReport("daily")}>
                Daily
              </Button>
              <Button variant="secondary" onClick={() => handleExportReport("weekly")}>
                Weekly
              </Button>
              <Button variant="secondary" onClick={() => handleExportReport("monthly")}>
                Monthly
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

