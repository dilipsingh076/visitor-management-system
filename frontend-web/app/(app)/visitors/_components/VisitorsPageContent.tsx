"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth";
import { PageHeader, LinkButton, Button, Avatar, EmptyState } from "@/components/ui";
import { useVisitorsPage } from "@/features/visitors";
import { PageWrapper, FilterPills, NotificationBanner, StatusBadge } from "@/components/common";
import { Users } from "lucide-react";
import { theme } from "@/lib/theme";

export function VisitorsPageContent() {
  const { user, loading: authLoading } = useAuth({ requireAuth: true });
  const router = useRouter();
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
      <div className={theme.table.wrap}>
        {loadingState ? (
          <div className={`py-8 text-center ${theme.text.muted}`}>Loading…</div>
        ) : visits.length === 0 ? (
          <EmptyState
            icon={<Users className="w-6 h-6" />}
            title={currentFilter ? `No ${currentFilter.replace("_", " ")} visits` : "No visits yet"}
            description={currentFilter ? "Try a different filter" : "Invite your first visitor to get started"}
            action={!currentFilter && canInvite ? <LinkButton href="/visitors/invite" variant="primary" size="sm">+ Invite Visitor</LinkButton> : undefined}
          />
        ) : (
          <table className="min-w-full">
            <thead className={theme.table.thead}>
              <tr>
                <th className={theme.table.th}>Visitor</th>
                <th className={theme.table.th}>Phone</th>
                <th className={theme.table.th}>Status</th>
                <th className={`${theme.table.th} hidden sm:table-cell`}>Purpose</th>
                <th className={`${theme.table.th} hidden md:table-cell`}>Date</th>
                <th className={theme.table.th}>Actions</th>
              </tr>
            </thead>
            <tbody className={theme.table.tbody}>
              {visits.map((v) => (
                <tr key={v.id} className={`cursor-pointer ${theme.table.rowHover}`} onClick={() => router.push(`/visitors/${v.id}`)}>
                  <td className={`${theme.table.td} font-medium text-foreground`}>
                    <div className="flex items-center gap-2">
                      <Avatar name={v.visitor_name} size="sm" />
                      <span>{v.visitor_name}</span>
                    </div>
                  </td>
                  <td className={`${theme.table.td} text-muted`}>{v.visitor_phone}</td>
                  <td className={theme.table.td}>
                    <StatusBadge status={v.status} />
                  </td>
                  <td className={`${theme.table.td} text-muted hidden sm:table-cell`}>{v.purpose || "—"}</td>
                  <td className={`${theme.table.td} text-xs text-muted-foreground hidden md:table-cell`}>{new Date(v.created_at).toLocaleString()}</td>
                  <td className={theme.table.td} onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
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
                      {(v.status === "approved" || v.status === "pending") && v.qr_code && (
                        <button
                          type="button"
                          className="text-xs font-medium px-2 py-1 rounded"
                          style={{ backgroundColor: "#25D366", color: "#fff" }}
                          onClick={() => {
                            const passUrl = `${window.location.origin}/pass/${v.id}`;
                            const msg = `Hi ${v.visitor_name || ""},\n\nYou have been invited for a visit.\n\nOpen your visitor pass:\n${passUrl}\n\nShow the QR code at the gate for entry.`;
                            const phone = (v.visitor_phone || "").replace(/\D/g, "");
                            const waPhone = phone.length === 10 ? `91${phone}` : phone;
                            window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`, "_blank");
                          }}
                        >
                          Share
                        </button>
                      )}
                      <Link href={`/visitors/${v.id}`} className="text-xs text-primary hover:underline">
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </PageWrapper>
  );
}
