"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Avatar, Button, Card, CardContent, CardHeader, StatCard, StatCardSkeleton } from "@/components/ui";
import type { User } from "@/lib/auth";
import { getPrimaryRole, getRoleResponsibility } from "@/lib/auth";
import { useDashboardStats } from "../hooks/useDashboardData";
import { useVisitorsList } from "@/features/visitors";
import { useGuardCheckout, useGuardExportMuster } from "@/features/guard";
import { theme } from "@/lib/theme";
import { SearchInput } from "@/components/common";

interface GuardDashboardProps {
  user: User;
}

const QUICK_ACTIONS: { href: string; label: string; primary?: boolean }[] = [
  { href: "/checkin", label: "Scan & check-in", primary: true },
  { href: "/checkin/walkin", label: "Walk-in" },
  { href: "/visitors", label: "All visitors" },
  { href: "/guard", label: "Guard view" },
  { href: "/blacklist", label: "Blacklist" },
];

export function GuardDashboard({ user }: GuardDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const statsQ = useDashboardStats(true);
  const approvedQ = useVisitorsList({ status: "approved", scope: "all", enabled: true });
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
      [v.visitor_name, v.visitor_phone, v.host_name].filter(Boolean).some((x) => String(x).toLowerCase().includes(q))
    );
  }, [expectedVisitors, searchQuery]);

  const checkingOutId = checkoutMutation.isPending ? (checkoutMutation.variables as string) : null;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-9 bg-muted-bg rounded-lg w-64 animate-pulse" />
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
      {/* Welcome + role */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Security desk</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {user.username} · {getRoleResponsibility(getPrimaryRole(user))}
        </p>
      </div>

      <section>
        <h2 className={`${theme.text.muted} mb-3`}>Quick tools</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => exportMuster()}>
            Export muster
          </Button>
        </div>
      </section>

      <section>
        <h2 className={`${theme.text.muted} mb-3`}>Today at a glance</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Expected" value={expectedVisitors.length} variant="primary" />
          <StatCard label="Inside" value={stats?.checked_in ?? checkedInVisitors.length} variant="success" />
          <StatCard label="Pending approval" value={stats?.pending_approvals ?? 0} variant="warning" />
          <StatCard label="Visitors today" value={stats?.visitors_today ?? 0} />
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 className={theme.text.muted}>Expected &amp; inside</h2>
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search visitor, phone, resident..."
            className="max-w-xs"
            aria-label="Search expected visitors"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card variant="outlined" className="overflow-hidden">
            <CardHeader className={`${theme.surface.cardHeader} py-3`}>
              <span className={theme.sectionTitle}>Expected ({filteredExpected.length})</span>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border max-h-72 overflow-y-auto">
                {filteredExpected.length === 0 ? (
                  <div className={`px-4 py-8 text-center ${theme.text.muted}`}>No expected visitors</div>
                ) : (
                  filteredExpected.slice(0, 15).map((visitor) => (
                    <div key={visitor.id} className="px-4 py-2.5 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex items-center gap-3">
                        <Avatar name={visitor.visitor_name} size="sm" />
                        <div className="min-w-0">
                          <p className={`${theme.text.body} font-medium text-foreground truncate`}>{visitor.visitor_name}</p>
                          <p className={`${theme.text.mutedSmall} truncate`}>{visitor.host_name || visitor.purpose || "—"}</p>
                          {visitor.otp && <p className="text-xs font-mono text-primary mt-0.5">OTP: {visitor.otp}</p>}
                        </div>
                      </div>
                      <Button size="xs" onClick={() => (window.location.href = "/checkin?focus=otp")}>Check in</Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined" className="overflow-hidden">
            <CardHeader className="border-b border-border border-success/20 bg-success/5 py-3">
              <span className={theme.sectionTitle}>Inside ({checkedInVisitors.length})</span>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border max-h-72 overflow-y-auto">
                {checkedInVisitors.length === 0 ? (
                  <div className={`px-4 py-8 text-center ${theme.text.muted}`}>No one inside</div>
                ) : (
                  checkedInVisitors.slice(0, 15).map((visitor) => (
                    <div key={visitor.id} className="px-4 py-2.5 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex items-center gap-3">
                        <Avatar name={visitor.visitor_name} size="sm" />
                        <div className="min-w-0">
                          <p className={`${theme.text.body} font-medium text-foreground truncate`}>{visitor.visitor_name}</p>
                          <p className={`${theme.text.mutedSmall} truncate`}>
                            {visitor.host_name} · {visitor.actual_arrival ? new Date(visitor.actual_arrival).toLocaleTimeString() : ""}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={() => checkoutMutation.mutate(visitor.id)}
                        loading={checkingOutId === visitor.id}
                        disabled={!!checkingOutId}
                      >
                        Check out
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
