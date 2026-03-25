"use client";

import {
  getPrimaryRole,
  canAccessPlatform,
  isSocietyAdmin,
  ROLE_LABELS,
} from "@/lib/auth";
import { useAuth } from "@/features/auth";
import {
  ResidentDashboard,
  GuardDashboard,
  ChairmanDashboard,
  SecretaryDashboard,
  TreasurerDashboard,
} from "@/components/dashboard";
import {
  StatCardSkeleton,
  PageHeader,
  StatCard,
  LinkButton,
  Text,
  EmptyState,
} from "@/components/ui";
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
  const isCommittee =
    isSocietyAdmin(primaryRole) && primaryRole !== "platform_admin";

  if (isPlatform) {
    const stats = statsQ.data;
    const societies = societiesQ.data ?? [];
    const statsLoading = statsQ.isLoading;
    const societiesLoading = societiesQ.isLoading;

    return (
      <PageWrapper width="narrow">
        <div className="space-y-6">
          <PageHeader
            title="Platform Admin"
            description="Manage all societies and platform-level settings."
          />

          <section>
            <Text variant="muted" as="h2" className="text-sm font-medium mb-3">
              Platform overview
            </Text>
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
                <StatCard
                  label="Total societies"
                  value={societies.length}
                  variant="primary"
                />
                <StatCard
                  label="Visitors today (all)"
                  value={stats?.visitors_today ?? 0}
                />
                <StatCard
                  label="Pending approvals (all)"
                  value={stats?.pending_approvals ?? 0}
                  variant="warning"
                />
                <StatCard
                  label="Currently inside (all)"
                  value={stats?.checked_in ?? 0}
                  variant="success"
                />
              </div>
            )}
          </section>

          <section>
            <Text variant="muted" as="h2" className="text-sm font-medium mb-3">
              Society management
            </Text>
            <div
              className={`${theme.surface.card} p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}
            >
              <div className="space-y-1">
                <p className={theme.sectionTitle}>Manage societies</p>
                <p className={theme.text.mutedSmall}>
                  View and onboard societies across the platform.
                </p>
              </div>
              <LinkButton href="/platform/societies" variant="primary" size="sm">
                Open societies panel
              </LinkButton>
            </div>
          </section>
        </div>
      </PageWrapper>
    );
  }

  if (!isCommittee && primaryRole !== "guard" && primaryRole !== "resident") {
    return (
      <PageWrapper width="narrow">
        <div className={`${theme.surface.card} p-6`}>
          <EmptyState
            title="No dashboard for your role"
            description={`Your role (“${ROLE_LABELS[primaryRole] ?? primaryRole}”) does not have a dashboard. Contact your society committee.`}
          />
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
