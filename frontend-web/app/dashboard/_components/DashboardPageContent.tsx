"use client";

import Link from "next/link";
import { getPrimaryRole, canAccessPlatform } from "@/lib/auth";
import { useAuth } from "@/features/auth";
import { ResidentDashboard, GuardDashboard, AdminDashboard } from "@/components/dashboard";
import { StatCardSkeleton } from "@/components/ui";

export function DashboardPageContent() {
  const { user, loading } = useAuth({ requireAuth: true });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-6">
          <div className="h-10 bg-muted-bg rounded-lg w-64 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

  if (canAccessPlatform(user)) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Platform Admin</h2>
          <p className="text-muted mb-6">Manage all societies and platform settings.</p>
          <Link
            href="/platform/societies"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover transition"
          >
            Manage societies
          </Link>
        </div>
      </div>
    );
  }

  if (primaryRole !== "admin" && primaryRole !== "guard" && primaryRole !== "resident") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">No dashboard for your role</h2>
          <p className="text-muted-foreground">Your role (&quot;{primaryRole}&quot;) does not have a dashboard. Contact your society admin to get the correct role assigned.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
      {primaryRole === "admin" && <AdminDashboard user={user} />}
      {primaryRole === "guard" && <GuardDashboard user={user} />}
      {primaryRole === "resident" && <ResidentDashboard user={user} />}
    </div>
  );
}
