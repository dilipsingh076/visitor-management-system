"use client";

import { usePlatformDashboard } from "@/features/admin/hooks/usePlatformDashboard";
import {
  PageHeader,
  StatCard,
  GrowthChart,
  BreakdownChart,
  Card,
  SkeletonCard,
  Button,
} from "./components";
import {
  Building2,
  Users,
  UserCheck,
  MessageSquare,
  HelpCircle,
  CreditCard,
  TrendingUp,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

function ActivityItem({
  type,
  description,
  time,
}: {
  type: string;
  description: string;
  time: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground line-clamp-1">{description || type}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{time}</p>
      </div>
    </div>
  );
}

function TopSocietyItem({
  name,
  visits,
  rank,
  id,
}: {
  name: string;
  visits: number;
  rank: number;
  id: string;
}) {
  return (
    <Link
      href={`/platform/societies/${id}`}
      className="flex items-center gap-3 py-2 hover:bg-muted-bg/50 px-2 -mx-2 rounded-lg transition"
    >
      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
        {rank}
      </span>
      <span className="flex-1 text-sm text-foreground truncate">{name}</span>
      <span className="text-sm text-muted-foreground">{visits}</span>
    </Link>
  );
}

function QuickAction({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:border-primary/30 hover:shadow-sm transition group"
    >
      <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-card transition">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
      </div>
      <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition" />
    </Link>
  );
}

export default function PlatformDashboardPage() {
  const { data, isLoading, error } = usePlatformDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Platform Dashboard"
          description="Overview of your visitor management platform"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error/10 text-error px-4 py-3 rounded-lg text-sm">
        Failed to load dashboard: {error.message}
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Dashboard"
        description="Overview of your visitor management platform"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Societies"
          value={stats?.total_societies ?? 0}
          icon={Building2}
          color="info"
        />
        <StatCard
          label="Active Societies"
          value={stats?.active_societies ?? 0}
          icon={Building2}
          color="success"
        />
        <StatCard
          label="Total Residents"
          value={stats?.total_residents ?? 0}
          icon={Users}
        />
        <StatCard
          label="Visitors Today"
          value={stats?.total_visitors_today ?? 0}
          icon={UserCheck}
          color="success"
        />
        <StatCard
          label="Visitors This Month"
          value={stats?.total_visitors_month ?? 0}
          icon={TrendingUp}
        />
        <StatCard
          label="Open Complaints"
          value={stats?.open_complaints ?? 0}
          icon={MessageSquare}
          color={stats?.open_complaints ? "warning" : "default"}
        />
        <StatCard
          label="Open Tickets"
          value={stats?.open_support_tickets ?? 0}
          icon={HelpCircle}
          color={stats?.open_support_tickets ? "warning" : "default"}
        />
        <StatCard
          label="Active Subscriptions"
          value={stats?.active_subscriptions ?? 0}
          icon={CreditCard}
          color="primary"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <QuickAction icon={Building2} label="Add New Society" href="/platform/societies/new" />
        <QuickAction icon={MessageSquare} label="View Complaints" href="/platform/complaints" />
        <QuickAction icon={HelpCircle} label="Support Tickets" href="/platform/support" />
        <QuickAction icon={CreditCard} label="Manage Subscriptions" href="/platform/subscriptions" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GrowthChart
          data={data?.society_growth || []}
          title="Society Growth (Last 30 Days)"
        />
        <BreakdownChart
          data={data?.complaint_breakdown || {}}
          title="Complaints by Category"
        />
      </div>

      {/* Activity and Top Societies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Recent Activity
            </h3>
            <Link href="/platform/audit-logs" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-0">
            {data?.recent_activity?.length ? (
              data.recent_activity.slice(0, 5).map((item) => (
                <ActivityItem
                  key={item.id}
                  type={item.activity_type}
                  description={item.description}
                  time={new Date(item.created_at).toLocaleString()}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No recent activity
              </p>
            )}
          </div>
        </Card>

        {/* Top Societies */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">
              Top Societies by Visitors
            </h3>
            <Link href="/platform/societies" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-0.5">
            {data?.top_societies?.length ? (
              data.top_societies.map((society, idx) => (
                <TopSocietyItem
                  key={society.id}
                  id={society.id}
                  name={society.name}
                  visits={society.visit_count}
                  rank={idx + 1}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No society data available
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
