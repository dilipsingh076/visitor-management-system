"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Avatar, Badge, Button, Input, EmptyState, StatCardSkeleton } from "@/components/ui";
import type { User } from "@/lib/auth";
import { useDashboardStats } from "../hooks/useDashboardData";
import { useVisitorsList } from "@/features/visitors";
import { useGuardCheckout, useGuardExportMuster } from "@/features/guard";

interface GuardDashboardProps {
  user: User;
}

const STATUS_COLORS: Record<
  string,
  "success" | "warning" | "error" | "info" | "default"
> = {
  checked_in: "success",
  approved: "info",
  pending: "warning",
  checked_out: "default",
  rejected: "error",
  expired: "error",
};

export function GuardDashboard({ user }: GuardDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const statsQ = useDashboardStats(true);
  const approvedQ = useVisitorsList({ status: "approved", scope: "all" , enabled: true});
  const checkedInQ = useVisitorsList({ status: "checked_in", scope: "all", enabled: true });

  const checkoutMutation = useGuardCheckout();
  const exportMuster = useGuardExportMuster();

  const expectedVisitors = approvedQ.data ?? [];
  const checkedInVisitors = checkedInQ.data ?? [];
  const stats = statsQ.data;

  const loading = statsQ.isLoading || approvedQ.isLoading || checkedInQ.isLoading;

  const filteredExpected = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return expectedVisitors;
    return expectedVisitors.filter((v) =>
      [v.visitor_name, v.visitor_phone, v.host_name]
        .filter(Boolean)
        .some((x) => String(x).toLowerCase().includes(q))
    );
  }, [expectedVisitors, searchQuery]);

  const checkingOutId = checkoutMutation.isPending
    ? (checkoutMutation.variables as string)
    : null;

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-success animate-pulse" />
            Security Desk
          </h1>
          <p className="text-muted-foreground">Welcome, {user.username}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => exportMuster()}>
            Muster Export
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Input
          placeholder="Search by visitor, phone, or resident..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/checkin"
          className="bg-primary text-white rounded-xl p-4 md:p-6 flex flex-col items-center justify-center gap-2 hover:bg-primary-hover transition shadow-lg shadow-primary/20"
        >
          <span className="font-semibold text-sm md:text-base">Scan QR / OTP</span>
        </Link>

        <Link
          href="/checkin/walkin"
          className="bg-warning text-white rounded-xl p-4 md:p-6 flex flex-col items-center justify-center gap-2 hover:bg-warning-hover transition shadow-lg shadow-warning/20"
        >
          <span className="font-semibold text-sm md:text-base">Walk-in Entry</span>
        </Link>

        <Link
          href="/blacklist"
          className="bg-card border border-border rounded-xl p-4 md:p-6 flex flex-col items-center justify-center gap-2 hover:bg-muted-bg transition"
        >
          <span className="font-semibold text-sm md:text-base text-foreground">Blacklist</span>
        </Link>

        <Link
          href="/visitors"
          className="bg-card border border-border rounded-xl p-4 md:p-6 flex flex-col items-center justify-center gap-2 hover:bg-muted-bg transition"
        >
          <span className="font-semibold text-sm md:text-base text-foreground">All Visitors</span>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-muted-foreground text-sm">Expected Today</p>
          <p className="text-2xl font-bold text-primary mt-1">
            {expectedVisitors.length}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-muted-foreground text-sm">Currently Inside</p>
          <p className="text-2xl font-bold text-success mt-1">
            {stats?.checked_in ?? checkedInVisitors.length}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-muted-foreground text-sm">Pending Approval</p>
          <p className="text-2xl font-bold text-warning mt-1">
            {stats?.pending_approvals ?? 0}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-muted-foreground text-sm">Total Today</p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {stats?.visitors_today ?? 0}
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expected Visitors */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-primary/5">
            <h2 className="text-lg font-semibold text-foreground">
              Expected Today ({filteredExpected.length})
            </h2>
          </div>

          {filteredExpected.length > 0 ? (
            <div className="divide-y divide-border max-h-96 overflow-y-auto">
              {filteredExpected.slice(0, 20).map((visitor) => (
                <div key={visitor.id} className="p-4 hover:bg-muted-bg/50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar name={visitor.visitor_name} size="md" />
                      <div>
                        <p className="font-medium text-foreground">{visitor.visitor_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(visitor.host_name && `${visitor.host_name} · `) || ""}
                          {visitor.purpose || "Visit"}
                        </p>
                        {visitor.otp && (
                          <p className="text-xs font-mono text-primary mt-1">OTP: {visitor.otp}</p>
                        )}
                      </div>
                    </div>
                    <Button size="sm" onClick={() => (window.location.href = "/checkin?focus=otp")}>
                      Check In
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title={searchQuery ? "No matching visitors" : "No expected visitors"}
              description={searchQuery ? "Try a different search term" : "No approved visitors yet"}
            />
          )}
        </div>

        {/* Currently Inside */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-success/5">
            <h2 className="text-lg font-semibold text-foreground">
              Currently Inside ({checkedInVisitors.length})
            </h2>
          </div>

          {checkedInVisitors.length > 0 ? (
            <div className="divide-y divide-border max-h-96 overflow-y-auto">
              {checkedInVisitors.slice(0, 20).map((visitor) => (
                <div key={visitor.id} className="p-4 hover:bg-muted-bg/50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar name={visitor.visitor_name} size="md" />
                      <div>
                        <p className="font-medium text-foreground">{visitor.visitor_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(visitor.host_name && `${visitor.host_name} · `) || ""}
                          {visitor.actual_arrival ? `In: ${new Date(visitor.actual_arrival).toLocaleTimeString()}` : ""}
                        </p>
                        <Badge variant={STATUS_COLORS[visitor.status] ?? "default"}>
                          {visitor.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => checkoutMutation.mutate(visitor.id)}
                      loading={checkingOutId === visitor.id}
                      disabled={checkingOutId === visitor.id}
                    >
                      Check Out
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No visitors inside" description="All visitors have checked out" />
          )}
        </div>
      </div>
    </div>
  );
}

