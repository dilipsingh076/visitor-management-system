"use client";

import Link from "next/link";
import { getPrimaryRole, canAccessPlatform, isSocietyAdmin, ROLE_LABELS } from "@/lib/auth";
import { useAuth } from "@/features/auth";
import { ResidentDashboard, GuardDashboard, ChairmanDashboard, SecretaryDashboard, TreasurerDashboard } from "@/components/dashboard";
import { StatCardSkeleton } from "@/components/ui";
import { PageWrapper } from "@/components/common";
import { theme } from "@/lib/theme";

export function DashboardPageContent() {
  const { user, loading } = useAuth({ requireAuth: true });

  if (loading) {
    return (
      <PageWrapper width="wide">
        <div className={theme.loading.page}>
          <div className={theme.loading.line} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!user) {
    return null;
  }

  const primaryRole = getPrimaryRole(user);
  const isCommittee = isSocietyAdmin(primaryRole) && primaryRole !== "platform_admin";

  if (canAccessPlatform(user)) {
    return (
      <PageWrapper width="narrow">
        <div className={`${theme.surface.card} p-8 text-center`}>
          <h2 className={`${theme.text.heading1} mb-2`}>Platform Admin</h2>
          <p className={`${theme.text.muted} mb-6`}>Manage all societies and platform settings.</p>
          <Link href="/platform/societies">
            <span className={`inline-flex items-center justify-center ${theme.button.sizeSm} ${theme.button.primary} ${theme.button.roundedLg} transition`}>
              Manage societies
            </span>
          </Link>
        </div>
      </PageWrapper>
    );
  }

  if (!isCommittee && primaryRole !== "guard" && primaryRole !== "resident") {
    return (
      <PageWrapper width="narrow">
        <div className={`${theme.surface.card} p-8 text-center`}>
          <h2 className={`${theme.text.heading1} mb-2`}>No dashboard for your role</h2>
          <p className={theme.text.muted}>Your role (&quot;{ROLE_LABELS[primaryRole] ?? primaryRole}&quot;) does not have a dashboard. Contact your society committee.</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper width="wide">
      {primaryRole === "chairman" && <ChairmanDashboard user={user} />}
      {primaryRole === "secretary" && <SecretaryDashboard user={user} />}
      {primaryRole === "treasurer" && <TreasurerDashboard user={user} />}
      {primaryRole === "guard" && <GuardDashboard user={user} />}
      {primaryRole === "resident" && <ResidentDashboard user={user} />}
    </PageWrapper>
  );
}
