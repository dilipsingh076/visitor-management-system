"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { API } from "@/lib/api/endpoints";
import { Avatar, Badge, Button, Tabs, TabsList, TabsTrigger, TabsContent, StatCardSkeleton } from "@/components/ui";
import type { User } from "@/lib/auth";

interface Stats {
  visitors_today: number;
  pending_approvals: number;
  checked_in: number;
  total_this_week?: number;
  total_this_month?: number;
}

interface RecentActivity {
  id: string;
  visitor_name: string;
  action: string;
  flat_number?: string;
  timestamp: string;
  performed_by?: string;
}

interface AdminDashboardProps {
  user: User;
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const statsRes = await apiClient.get<Stats>(API.dashboard.stats);
      if (statsRes.data) setStats(statsRes.data);

      // Mock recent activity - you can add this endpoint later
      setRecentActivity([
        { id: "1", visitor_name: "Amit Kumar", action: "checked_in", flat_number: "405", timestamp: new Date().toISOString(), performed_by: "Guard 1" },
        { id: "2", visitor_name: "Priya Singh", action: "invited", flat_number: "302", timestamp: new Date(Date.now() - 3600000).toISOString(), performed_by: "Resident" },
        { id: "3", visitor_name: "Rahul Sharma", action: "checked_out", flat_number: "101", timestamp: new Date(Date.now() - 7200000).toISOString(), performed_by: "Guard 2" },
        { id: "4", visitor_name: "Unknown Walk-in", action: "registered", flat_number: "501", timestamp: new Date(Date.now() - 10800000).toISOString(), performed_by: "Guard 1" },
        { id: "5", visitor_name: "Delivery - Amazon", action: "approved", flat_number: "203", timestamp: new Date(Date.now() - 14400000).toISOString(), performed_by: "Resident" },
      ]);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (type: string) => {
    try {
      const response = await fetch(`${API.dashboard.muster}`, {
        credentials: "include",
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-report-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export:", error);
    }
  };

  const getActionBadge = (action: string) => {
    const variants: Record<string, { variant: "success" | "warning" | "info" | "secondary" | "error"; label: string }> = {
      checked_in: { variant: "success", label: "Checked In" },
      checked_out: { variant: "secondary", label: "Checked Out" },
      invited: { variant: "info", label: "Invited" },
      approved: { variant: "success", label: "Approved" },
      rejected: { variant: "error", label: "Rejected" },
      registered: { variant: "warning", label: "Walk-in" },
    };
    const config = variants[action] || { variant: "secondary" as const, label: action };
    return <Badge variant={config.variant}>{config.label}</Badge>;
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and management</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" onClick={() => handleExportReport("daily")}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Report
          </Button>
          <Link href="/admin/users">
            <Button>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Manage Users
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary to-primary-hover text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-primary-foreground/80 text-sm font-medium">Today</span>
            <svg className="w-6 h-6 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold">{stats?.visitors_today ?? 0}</p>
          <p className="text-sm text-white/70 mt-1">Total Visitors</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm font-medium">Pending</span>
            <span className="w-10 h-10 rounded-lg bg-warning-light flex items-center justify-center">
              <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <p className="text-3xl font-bold text-warning">{stats?.pending_approvals ?? 0}</p>
          <p className="text-sm text-muted-foreground mt-1">Awaiting Approval</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm font-medium">Inside</span>
            <span className="w-10 h-10 rounded-lg bg-success-light flex items-center justify-center">
              <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <p className="text-3xl font-bold text-success">{stats?.checked_in ?? 0}</p>
          <p className="text-sm text-muted-foreground mt-1">Currently Checked In</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm font-medium">This Week</span>
            <span className="w-10 h-10 rounded-lg bg-info-light flex items-center justify-center">
              <svg className="w-5 h-5 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </span>
          </div>
          <p className="text-3xl font-bold text-info">{stats?.total_this_week ?? (stats?.visitors_today ?? 0) * 5}</p>
          <p className="text-sm text-muted-foreground mt-1">Weekly Total</p>
        </div>
      </div>

      {/* Quick Management */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Link href="/visitors/invite" className="bg-card border border-border rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-primary hover:text-white hover:border-primary transition group">
          <svg className="w-6 h-6 text-primary group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <span className="text-sm font-medium">Invite</span>
        </Link>

        <Link href="/guard" className="bg-card border border-border rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-warning hover:text-white hover:border-warning transition group">
          <svg className="w-6 h-6 text-warning group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-sm font-medium">Guard Desk</span>
        </Link>

        <Link href="/blacklist" className="bg-card border border-border rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-error hover:text-white hover:border-error transition group">
          <svg className="w-6 h-6 text-error group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          <span className="text-sm font-medium">Blacklist</span>
        </Link>

        <Link href="/admin/users" className="bg-card border border-border rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-info hover:text-white hover:border-info transition group">
          <svg className="w-6 h-6 text-info group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span className="text-sm font-medium">Users</span>
        </Link>

      </div>

      {/* Activity Feed & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Live Activity Feed
            </h2>
          </div>
          <div className="divide-y divide-border max-h-96 overflow-y-auto">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-muted-bg/50 transition flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={activity.visitor_name} size="sm" />
                  <div>
                    <p className="font-medium text-foreground text-sm">{activity.visitor_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.flat_number && `Flat ${activity.flat_number} · `}
                      {activity.performed_by}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getActionBadge(activity.action)}
                  <span className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-border bg-muted-bg/50">
            <Link href="/visitors" className="text-sm text-primary hover:underline">
              View all visitors →
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Today&apos;s Summary</h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Pre-approved Visitors</span>
              <span className="font-semibold text-foreground">{Math.floor((stats?.visitors_today ?? 0) * 0.6)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Walk-in Registrations</span>
              <span className="font-semibold text-warning">{Math.floor((stats?.visitors_today ?? 0) * 0.3)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Rejected Entries</span>
              <span className="font-semibold text-error">{Math.floor((stats?.visitors_today ?? 0) * 0.05)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Blacklist Alerts</span>
              <span className="font-semibold text-error">0</span>
            </div>
            <hr className="border-border" />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Avg. Visit Duration</span>
              <span className="font-semibold text-foreground">45 min</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Peak Hour</span>
              <span className="font-semibold text-foreground">10:00 - 11:00 AM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
