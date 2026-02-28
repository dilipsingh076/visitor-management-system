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
    redirectTo: "/dashboard?message=Guard+or+admin+only",
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
      <div className="max-w-md mx-auto px-4 py-10 text-center text-muted">
        <p>Check-in at gate is for Guard or Admin only.</p>
        <p className="mt-2 text-sm">Redirecting...</p>
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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-foreground mb-2">Check In</h1>
      <p className="text-muted mb-8">Scan QR or enter OTP to check in a visitor</p>

      {success && (
        <div className="mb-6 p-4 bg-primary-muted border border-primary/30 rounded-lg text-primary">
          ✓ Check-in successful!
        </div>
      )}

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-8 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Scan QR Code</h2>
          <div className="aspect-square max-w-[280px] mx-auto bg-muted-bg rounded-xl flex items-center justify-center">
            <span className="text-muted-foreground text-sm">QR Scanner (coming soon)</span>
          </div>
        </div>

        <form onSubmit={handleCheckIn} className="p-8">
          <div className="text-center text-muted-foreground text-sm mb-4">— or enter OTP —</div>
          {error && <div className="mb-4 p-3 bg-error-light text-error rounded-lg text-sm">{error}</div>}
          <Input
            label="6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            maxLength={6}
          />
          <div className="mb-4 flex items-start gap-3">
            <input
              type="checkbox"
              id="consent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="consent" className="text-sm text-muted">
              I consent to my data being collected for this visit (DPDP Act 2023). This is required for check-in.
            </label>
          </div>
          <Button type="submit" disabled={loading || !consent} fullWidth>
            {loading ? "Processing..." : "Check In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
