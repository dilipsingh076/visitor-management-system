"use client";

import Link from "next/link";
import { canAccessGuardPage } from "@/lib/auth";
import { useAuth } from "@/features/auth";
import {
  GuardSection,
  GuardVisitsTable,
  BlacklistSection,
  useGuardPending,
  useGuardApproved,
  useGuardCheckedIn,
  useGuardBlacklist,
  useGuardCheckout,
  useGuardBlacklistByPhone,
  useGuardBlacklistByVisitorId,
  useGuardRemoveBlacklist,
  useGuardExportMuster,
} from "@/features/guard";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui";

export function GuardPageContent() {
  const { user, loading: authLoading } = useAuth({
    requireAuth: true,
    requireRole: canAccessGuardPage,
    redirectTo: "/dashboard?message=Guard+or+admin+only",
  });

  const pendingQ = useGuardPending();
  const approvedQ = useGuardApproved();
  const checkedInQ = useGuardCheckedIn();
  const blacklistQ = useGuardBlacklist();
  const checkoutMutation = useGuardCheckout();
  const blacklistByPhoneMutation = useGuardBlacklistByPhone();
  const blacklistByVisitorIdMutation = useGuardBlacklistByVisitorId();
  const removeBlacklistMutation = useGuardRemoveBlacklist();
  const exportMuster = useGuardExportMuster();

  const pending = pendingQ.data ?? [];
  const approved = approvedQ.data ?? [];
  const checkedIn = checkedInQ.data ?? [];
  const blacklist = blacklistQ.data ?? [];
  const dataLoading =
    pendingQ.isLoading ||
    approvedQ.isLoading ||
    checkedInQ.isLoading ||
    blacklistQ.isLoading;
  const loading = authLoading || dataLoading;

  const actionLoading = {
    checkout: checkoutMutation.isPending ? (checkoutMutation.variables as string) : null,
    blacklist:
      blacklistByPhoneMutation.isPending || blacklistByVisitorIdMutation.isPending,
    removeBlacklist: removeBlacklistMutation.isPending
      ? (removeBlacklistMutation.variables as string)
      : null,
  };

  const addToBlacklistByPhone = async (payload: {
    visitor_name: string;
    visitor_phone: string;
    reason: string;
  }) => {
    try {
      const res = await blacklistByPhoneMutation.mutateAsync(payload);
      return !res?.error;
    } catch {
      return false;
    }
  };
  const addToBlacklistByVisitorId = (visitorId: string, reason: string) => {
    blacklistByVisitorIdMutation.mutate({ visitorId, reason });
  };
  const removeFromBlacklist = async (visitorId: string) => {
    await removeBlacklistMutation.mutateAsync(visitorId);
    return true;
  };
  const checkout = (visitId: string) => checkoutMutation.mutate(visitId);

  if (!user) return null;
  if (!canAccessGuardPage(user)) {
    return (
      <PageContainer>
        <div className="text-center py-12 text-muted-foreground">
          <p>Access denied. This page is for Guard or Admin only.</p>
          <p className="mt-2 text-sm">Redirecting to dashboard…</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="4xl">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Guard Dashboard
          </h1>
          <p className="text-muted-foreground mt-0.5">
            Walk-ins and visit status at the gate
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => exportMuster()}
          >
            Export Muster (CSV)
          </Button>
          <Link href="/checkin/walkin">
            <Button variant="primary" className="bg-warning hover:bg-warning/90">
              + Register Walk-in
            </Button>
          </Link>
        </div>
      </header>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          Loading…
        </div>
      ) : (
        <div className="space-y-8">
          <GuardSection
            title="Waiting for resident approval"
            description="Do not allow entry. Resident has been notified on their dashboard."
            variant="warning"
            icon={<span aria-hidden>⏳</span>}
          >
            <GuardVisitsTable
              visits={pending}
              columns={[
                { key: "visitor_name", label: "Visitor" },
                { key: "host_name", label: "Wants to meet" },
                { key: "purpose", label: "Purpose" },
                { key: "visitor_phone", label: "Phone" },
                { key: "actions", label: "" },
              ]}
              emptyMessage="No pending walk-ins"
              secondaryAction={{
                label: "Blacklist",
                onClick: (v) => {
                  if (window.confirm("Add this visitor to blacklist? They will not be able to check in.")) {
                    addToBlacklistByVisitorId(v.visitor_id, "Blacklisted from guard dashboard");
                  }
                },
                disabled: actionLoading.blacklist,
              }}
            />
          </GuardSection>

          <GuardSection
            title="Approved by resident"
            description="Walk-ins: once the resident approves, the visitor is automatically allowed in and appears in Currently inside. Pre-invited visits: visitor may check in with OTP."
            variant="success"
            icon={<span aria-hidden>✓</span>}
          >
            <GuardVisitsTable
              visits={approved}
              columns={[
                { key: "visitor_name", label: "Visitor" },
                { key: "host_name", label: "Host" },
                { key: "purpose", label: "Purpose" },
                { key: "actions", label: "" },
              ]}
              emptyMessage="No approved visits waiting"
              secondaryAction={{
                label: "Blacklist",
                onClick: (v) => {
                  if (window.confirm("Add this visitor to blacklist? They will not be able to check in.")) {
                    addToBlacklistByVisitorId(v.visitor_id, "Blacklisted from guard dashboard");
                  }
                },
                disabled: actionLoading.blacklist,
              }}
            />
          </GuardSection>

          <GuardSection
            title="Currently inside"
            description="Visitors checked in. Use Check-out when they leave."
            variant="primary"
            icon={<span aria-hidden>📍</span>}
          >
            <GuardVisitsTable
              visits={checkedIn}
              columns={[
                { key: "visitor_name", label: "Visitor" },
                { key: "host_name", label: "Host" },
                { key: "purpose", label: "Purpose" },
                { key: "actions", label: "Action" },
              ]}
              emptyMessage="No visitors currently inside"
              action={{
                label: "Check-out",
                onClick: (v) => checkout(v.id),
                loadingId: actionLoading.checkout,
                variant: "primary",
              }}
            />
          </GuardSection>

          <BlacklistSection
            entries={blacklist}
            loading={actionLoading.blacklist}
            removeLoadingId={actionLoading.removeBlacklist}
            onAddByPhone={addToBlacklistByPhone}
            onRemove={removeFromBlacklist}
          />
        </div>
      )}

      <footer className="mt-8 flex flex-wrap gap-4 text-sm">
        <Link href="/visitors" className="text-muted-foreground hover:text-primary">
          View all visitors →
        </Link>
        <Link href="/checkin" className="text-muted-foreground hover:text-primary">
          Check-in (OTP/QR) →
        </Link>
      </footer>
    </PageContainer>
  );
}
