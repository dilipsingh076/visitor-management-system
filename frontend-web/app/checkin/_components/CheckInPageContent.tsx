"use client";

import { useState } from "react";
import { canAccessCheckin } from "@/lib/auth";
import { useAuth } from "@/features/auth";
import { Input, Button } from "@/components/ui";
import { useCheckInOtp } from "@/features/checkin";
import { PageWrapper } from "@/components/common";
import { theme } from "@/lib/theme";

export function CheckInPageContent() {
  const { user, loading: authLoading } = useAuth({
    requireAuth: true,
    requireRole: canAccessCheckin,
    redirectTo: "/dashboard?message=Guard+or+committee+only",
  });
  const [otp, setOtp] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const checkInOtpMutation = useCheckInOtp();
  const loading = checkInOtpMutation.isPending;

  if (authLoading || !user) return null;
  if (!canAccessCheckin(user)) {
    return (
      <PageWrapper width="narrower">
        <div className={`text-center ${theme.text.muted}`}>
          <p>Check-in is for Guard or Committee only.</p>
          <p className={`mt-1 ${theme.text.mutedSmall}`}>Redirecting…</p>
        </div>
      </PageWrapper>
    );
  }

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (otp.length !== 6) {
      setError("Enter 6-digit OTP");
      return;
    }
    if (!consent) {
      setError("Please consent to data collection (DPDP Act 2023)");
      return;
    }
    try {
      await checkInOtpMutation.mutateAsync({ otp, consent_given: consent });
      setSuccess(true);
      setOtp("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Check-in failed");
    }
  };

  return (
    <PageWrapper width="narrower">
      <h1 className={`${theme.text.heading1} mb-0.5`}>Check In</h1>
      <p className={`${theme.text.mutedSmall} mb-5`}>Scan QR or enter OTP</p>

      {success && (
        <div className={`mb-4 ${theme.alert.base} ${theme.alert.success}`}>
          ✓ Check-in successful
        </div>
      )}

      <div className={theme.surface.card}>
        <div className={`p-4 ${theme.surface.cardHeader}`}>
          <h2 className={`${theme.sectionTitle} mb-3`}>QR Code</h2>
          <div className="aspect-square max-w-[200px] mx-auto bg-muted-bg rounded-lg flex items-center justify-center">
            <span className={theme.text.mutedSmall}>Scanner (coming soon)</span>
          </div>
        </div>

        <form onSubmit={handleCheckIn} className="p-4">
          <p className={`text-center ${theme.text.mutedSmall} mb-3`}>— or enter OTP —</p>
          {error && <div className={`mb-3 ${theme.alert.error}`}>{error}</div>}
          <Input
            label="6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            noMargin
          />
          <div className="mb-4 flex items-start gap-2">
            <input
              type="checkbox"
              id="consent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="consent" className={theme.text.mutedSmall}>
              I consent to data collection for this visit (DPDP Act 2023).
            </label>
          </div>
          <Button type="submit" disabled={loading || !consent} fullWidth size="sm">
            {loading ? "…" : "Check In"}
          </Button>
        </form>
      </div>
    </PageWrapper>
  );
}
