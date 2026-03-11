"use client";

import { useState } from "react";
import { canAccessCheckin } from "@/lib/auth";
import { useAuth } from "@/features/auth";
import { Input, Button } from "@/components/ui";
import { useCheckInOtp } from "@/features/checkin";

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
      <div className="max-w-md mx-auto px-4 py-6 text-center text-sm text-muted">
        <p>Check-in is for Guard or Committee only.</p>
        <p className="mt-1 text-xs">Redirecting…</p>
      </div>
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
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-6">
      <h1 className="text-xl font-semibold text-foreground mb-0.5">Check In</h1>
      <p className="text-xs text-muted mb-5">Scan QR or enter OTP</p>

      {success && (
        <div className="mb-4 px-3 py-2 bg-primary-muted border border-primary/30 rounded-lg text-sm text-primary">
          ✓ Check-in successful
        </div>
      )}

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground mb-3">QR Code</h2>
          <div className="aspect-square max-w-[200px] mx-auto bg-muted-bg rounded-lg flex items-center justify-center">
            <span className="text-xs text-muted-foreground">Scanner (coming soon)</span>
          </div>
        </div>

        <form onSubmit={handleCheckIn} className="p-4">
          <p className="text-center text-muted-foreground text-xs mb-3">— or enter OTP —</p>
          {error && <div className="mb-3 px-3 py-2 bg-error-light text-error rounded text-xs">{error}</div>}
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
            <label htmlFor="consent" className="text-xs text-muted">
              I consent to data collection for this visit (DPDP Act 2023).
            </label>
          </div>
          <Button type="submit" disabled={loading || !consent} fullWidth size="sm">
            {loading ? "…" : "Check In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
