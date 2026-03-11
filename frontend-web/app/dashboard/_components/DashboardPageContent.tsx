"use client";

import Link from "next/link";
import { getPrimaryRole, canAccessPlatform, isSocietyAdmin, ROLE_LABELS } from "@/lib/auth";
import { useAuth } from "@/features/auth";
import { ResidentDashboard, GuardDashboard, AdminDashboard } from "@/components/dashboard";
import { StatCardSkeleton } from "@/components/ui";

export function DashboardPageContent() {
  const { user, loading } = useAuth({ requireAuth: true });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-6">
          <div className="h-8 bg-muted-bg rounded-lg w-56 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const primaryRole = getPrimaryRole(user);
  const showCommitteeDashboard = isSocietyAdmin(primaryRole) && primaryRole !== "platform_admin";

  if (canAccessPlatform(user)) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-card border border-border rounded-xl shadow-[var(--shadow-md)] p-8 text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Platform Admin</h2>
          <p className="text-sm text-muted-foreground mb-6">Manage all societies and platform settings.</p>
          <Link href="/platform/societies">
            <span className="inline-flex items-center justify-center px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition shadow-[var(--shadow-button)]">
              Manage societies
            </span>
          </Link>
        </div>
      </div>
    );
  }

  if (!showCommitteeDashboard && primaryRole !== "guard" && primaryRole !== "resident") {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-card border border-border rounded-xl shadow-[var(--shadow-md)] p-8 text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">No dashboard for your role</h2>
          <p className="text-sm text-muted-foreground">Your role (&quot;{ROLE_LABELS[primaryRole] ?? primaryRole}&quot;) does not have a dashboard. Contact your society committee.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {showCommitteeDashboard && <AdminDashboard user={user} />}
      {primaryRole === "guard" && <GuardDashboard user={user} />}
      {primaryRole === "resident" && <ResidentDashboard user={user} />}
    </div>
  );
}
