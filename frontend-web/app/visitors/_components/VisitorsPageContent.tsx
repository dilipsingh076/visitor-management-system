"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth";
import { PageHeader, LinkButton, Card, Button } from "@/components/ui";
import { useVisitorsPage } from "@/features/visitors";
import { PageWrapper, FilterPills, NotificationBanner, StatusBadge } from "@/components/common";
import { theme } from "@/lib/theme";

export function VisitorsPageContent() {
  const { user, loading: authLoading } = useAuth({ requireAuth: true });
  const {
    visits,
    notifications,
    loading: dataLoading,
    filterOptions,
    currentFilter,
    canInvite,
    markRead,
    dismissingNotificationId,
    approve,
    approvingId,
  } = useVisitorsPage(user ?? null);

  if (!user) return null;

  const loadingState = authLoading || dataLoading;

  return (
    <PageWrapper>
      <PageHeader
        title="Visitors"
        description={canInvite ? "Pending invites need your approval." : "View visits (guards & committee see all)."}
        action={canInvite ? <LinkButton href="/visitors/invite" variant="primary" size="sm">+ Invite</LinkButton> : undefined}
      />
      <NotificationBanner
        items={notifications.map((n) => ({ id: n.id, title: n.title, body: n.body }))}
        onDismiss={markRead}
        dismissingId={dismissingNotificationId}
      />
      <FilterPills options={filterOptions} currentValue={currentFilter} className="mb-4" />
      <Card className="overflow-hidden rounded-lg">
        {loadingState ? (
          <div className={`py-8 text-center ${theme.text.muted}`}>Loading…</div>
        ) : visits.length === 0 ? (
          <div className={`py-8 text-center ${theme.text.muted}`}>
            {currentFilter ? `No ${currentFilter.replace("_", " ")} visits` : "No visits yet."}
            {!currentFilter && " "}
            {!currentFilter && <Link href="/visitors/invite" className={theme.button.link}>Invite visitor</Link>}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted-bg/50">
              <tr>
                <th className={`px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase`}>Visitor</th>
                <th className={`px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase`}>Phone</th>
                <th className={`px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase`}>Status</th>
                <th className={`px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase hidden sm:table-cell`}>Purpose</th>
                <th className={`px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase hidden md:table-cell`}>Date</th>
                <th className={`px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-border bg-card ${theme.list.rowHoverLight}`}>
              {visits.map((v) => (
                <tr key={v.id}>
                  <td className={`px-3 py-2 ${theme.text.body} font-medium text-foreground`}>{v.visitor_name}</td>
                  <td className={`px-3 py-2 ${theme.text.body} text-muted`}>{v.visitor_phone}</td>
                  <td className="px-3 py-2">
                    <StatusBadge status={v.status} />
                  </td>
                  <td className={`px-3 py-2 ${theme.text.body} text-muted hidden sm:table-cell`}>{v.purpose || "—"}</td>
                  <td className={`px-3 py-2 ${theme.text.mutedSmall} hidden md:table-cell`}>{new Date(v.created_at).toLocaleString()}</td>
                  <td className="px-3 py-2">
                    {v.status === "pending" && canInvite && (
                      <Button
                        size="xs"
                        variant="primary"
                        onClick={() => approve(v.id)}
                        disabled={approvingId === v.id}
                      >
                        {approvingId === v.id ? "…" : "Approve"}
                      </Button>
                    )}
                    {v.status === "approved" && v.otp && <span className={theme.text.mutedSmall}>OTP: {v.otp}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </PageWrapper>
  );
}
