"use client";

import Link from "next/link";
import { getPrimaryRole, canAccessPlatform, isSocietyAdmin, ROLE_LABELS } from "@/lib/auth";
import { useAuth } from "@/features/auth";
import { ResidentDashboard, GuardDashboard, ChairmanDashboard, SecretaryDashboard, TreasurerDashboard } from "@/components/dashboard";
import { StatCardSkeleton } from "@/components/ui";
import { PageWrapper } from "@/components/common";
import { theme } from "@/lib/theme";
import { useDashboardStats } from "@/features/dashboard/hooks/useDashboardData";
import { useSocieties } from "@/features/platform";

export function DashboardPageContent() {
  const { user, loading } = useAuth({ requireAuth: true });
  const isPlatform = canAccessPlatform(user);
  const statsQ = useDashboardStats(isPlatform);
  const societiesQ = useSocieties(isPlatform);

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

  if (isPlatform) {
    const stats = statsQ.data;
    const societies = societiesQ.data ?? [];
    const statsLoading = statsQ.isLoading;
    const societiesLoading = societiesQ.isLoading;

    return (
      <PageWrapper width="narrow">
        <div className="space-y-6">
          <div>
            <h1 className={theme.text.heading2}>Platform Admin</h1>
            <p className={theme.text.subtitle}>
              Manage all societies and platform-level settings.
            </p>
          </div>

          <section>
            <h2 className={`${theme.text.muted} mb-3`}>Platform overview</h2>
            {statsLoading || societiesLoading ? (
              <div className={theme.loading.page}>
                <div className={theme.loading.line} />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className={theme.statCard.root}>
                  <p className={theme.statCard.label}>Total societies</p>
                  <p className={theme.statCard.value}>{societies.length}</p>
                </div>
                <div className={theme.statCard.root}>
                  <p className={theme.statCard.label}>Visitors today (all)</p>
                  <p className={theme.statCard.value}>{stats?.visitors_today ?? 0}</p>
                </div>
                <div className={theme.statCard.root}>
                  <p className={theme.statCard.label}>Pending approvals (all)</p>
                  <p className={theme.statCard.valueWarning}>{stats?.pending_approvals ?? 0}</p>
                </div>
                <div className={theme.statCard.root}>
                  <p className={theme.statCard.label}>Currently inside (all)</p>
                  <p className={theme.statCard.valueSuccess}>{stats?.checked_in ?? 0}</p>
                </div>
              </div>
            )}
          </section>

          <section>
            <h2 className={`${theme.text.muted} mb-3`}>Society management</h2>
            <div className={`${theme.surface.card} p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
              <div className="space-y-1">
                <p className={theme.sectionTitle}>Manage societies</p>
                <p className={theme.text.mutedSmall}>
                  View and onboard societies across the platform.
                </p>
              </div>
              <Link href="/platform/societies">
                <span
                  className={`inline-flex items-center justify-center ${theme.button.sizeSm} ${theme.button.primary} ${theme.button.roundedLg} transition`}
                >
                  Open societies panel
                </span>
              </Link>
            </div>
          </section>
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
