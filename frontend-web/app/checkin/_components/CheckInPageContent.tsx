"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { canAccessCheckin } from "@/lib/auth";
import { useAuth } from "@/features/auth";
import { Input, Button, PageHeader, Alert } from "@/components/ui";
import { useCheckInOtp, useCheckInQr } from "@/features/checkin";
import { PageWrapper } from "@/components/common";
import { theme } from "@/lib/theme";

export function CheckInPageContent() {
  const { user, loading: authLoading } = useAuth({
    requireAuth: true,
    requireRole: canAccessCheckin,
    redirectTo: "/dashboard?message=Guard+or+committee+only",
  });
  const router = useRouter();

  // QR scanner state
  const [scannedValue, setScannedValue] = useState("");
  const [scannerError, setScannerError] = useState("");
  const [scannerReady, setScannerReady] = useState(false);
  const scannerRef = useRef<any>(null);
  const scannerDivId = "qr-reader";

  // QR check-in state
  const [qrConsent, setQrConsent] = useState(false);
  const [qrError, setQrError] = useState("");
  const checkInQrMutation = useCheckInQr();
  const qrLoading = checkInQrMutation.isPending;

  // OTP fallback state
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpConsent, setOtpConsent] = useState(false);
  const [otpError, setOtpError] = useState("");
  const checkInOtpMutation = useCheckInOtp();
  const otpLoading = checkInOtpMutation.isPending;

  // Initialize QR scanner
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (authLoading || !user) return;
    if (!canAccessCheckin(user)) return;

    let html5QrCode: any = null;
    let mounted = true;

    const initScanner = async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (!mounted) return;

        html5QrCode = new Html5Qrcode(scannerDivId);
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText: string) => {
            if (mounted) {
              setScannedValue(decodedText);
              // Pause scanner after successful scan
              html5QrCode.pause?.();
            }
          },
          () => {
            // Ignore scan failures (no QR found in frame)
          }
        );

        if (mounted) setScannerReady(true);
      } catch (err) {
        if (mounted) {
          setScannerError(
            err instanceof Error
              ? err.message
              : "Could not start camera. Please allow camera access or use OTP."
          );
        }
      }
    };

    initScanner();

    return () => {
      mounted = false;
      if (html5QrCode) {
        html5QrCode
          .stop()
          .catch(() => {})
          .finally(() => {
            html5QrCode.clear?.();
          });
      }
    };
  }, [authLoading, user]);

  // Handle QR check-in
  const handleQrCheckIn = useCallback(async () => {
    setQrError("");
    if (!qrConsent) {
      setQrError("Please consent to data collection (DPDP Act 2023)");
      return;
    }
    try {
      await checkInQrMutation.mutateAsync({
        qr_code: scannedValue,
        consent_given: true,
      });
      router.push("/visitors?message=Check-in+successful");
    } catch (err) {
      setQrError(err instanceof Error ? err.message : "Check-in failed");
    }
  }, [scannedValue, qrConsent, checkInQrMutation, router]);

  // Handle re-scan
  const handleRescan = useCallback(() => {
    setScannedValue("");
    setQrError("");
    setQrConsent(false);
    try {
      scannerRef.current?.resume?.();
    } catch {
      // If resume fails, scanner is probably stopped
    }
  }, []);

  // Handle OTP check-in
  const handleOtpCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");
    if (otp.length !== 6) {
      setOtpError("Enter 6-digit OTP");
      return;
    }
    if (!otpConsent) {
      setOtpError("Please consent to data collection (DPDP Act 2023)");
      return;
    }
    try {
      await checkInOtpMutation.mutateAsync({
        otp,
        consent_given: otpConsent,
      });
      router.push("/visitors?message=Check-in+successful");
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "Check-in failed");
    }
  };

  if (authLoading || !user) return null;
  if (!canAccessCheckin(user)) {
    return (
      <PageWrapper width="narrower">
        <div className={`text-center ${theme.text.muted}`}>
          <p>Check-in is for Guard or Committee only.</p>
          <p className={`mt-1 ${theme.text.mutedSmall}`}>Redirecting...</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper width="narrower">
      <h1 className={`${theme.text.heading1} mb-0.5`}>Check In</h1>
      <p className={`${theme.text.mutedSmall} mb-5`}>
        Scan visitor QR code for check-in
      </p>

      {/* QR Scanner Section */}
      <div className={theme.surface.card}>
        <div className={`p-4 ${theme.surface.cardHeader}`}>
          <h2 className={`${theme.sectionTitle} mb-3`}>QR Scanner</h2>

          {!scannedValue ? (
            <>
              {/* Scanner viewport */}
              <div
                id={scannerDivId}
                className="mx-auto rounded-lg overflow-hidden"
                style={{ maxWidth: 300 }}
              />

              {scannerError && (
                <Alert variant="error" className="mt-3 text-sm">
                  {scannerError}
                </Alert>
              )}

              {!scannerReady && !scannerError && (
                <div className="text-center py-6">
                  <p className={theme.text.mutedSmall}>
                    Starting camera...
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Scanned result - confirmation card */
            <div className="mt-2">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
                <p className="text-green-800 text-sm font-medium mb-1">
                  QR Code Scanned
                </p>
                <p className="text-green-700 text-xs font-mono break-all">
                  {scannedValue}
                </p>
              </div>

              {qrError && (
                <Alert variant="error" className="mb-3 text-sm">
                  {qrError}
                </Alert>
              )}

              <div className="mb-3 flex items-start gap-2">
                <input
                  type="checkbox"
                  id="qr-consent"
                  checked={qrConsent}
                  onChange={(e) => setQrConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="qr-consent" className={theme.text.mutedSmall}>
                  I consent to data collection for this visit (DPDP Act 2023).
                </label>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleRescan}
                  className="flex-1"
                >
                  Re-scan
                </Button>
                <Button
                  size="sm"
                  onClick={handleQrCheckIn}
                  disabled={qrLoading || !qrConsent}
                  className="flex-1"
                >
                  {qrLoading ? "..." : "Check In"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Collapsible OTP Section */}
        <div className="border-t border-border">
          <button
            type="button"
            onClick={() => setShowOtp(!showOtp)}
            className="w-full px-4 py-3 flex items-center justify-between text-left"
          >
            <span className={`${theme.text.mutedSmall} font-medium`}>
              Backup: Enter OTP manually
            </span>
            <span className={`${theme.text.mutedSmall} text-xs`}>
              {showOtp ? "Hide" : "Show"}
            </span>
          </button>

          {showOtp && (
            <form onSubmit={handleOtpCheckIn} className="px-4 pb-4">
              {otpError && (
                <Alert variant="error" className="mb-3 text-sm">
                  {otpError}
                </Alert>
              )}
              <Input
                label="6-digit OTP"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                maxLength={6}
                noMargin
              />
              <div className="mb-4 flex items-start gap-2">
                <input
                  type="checkbox"
                  id="otp-consent"
                  checked={otpConsent}
                  onChange={(e) => setOtpConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <label
                  htmlFor="otp-consent"
                  className={theme.text.mutedSmall}
                >
                  I consent to data collection for this visit (DPDP Act 2023).
                </label>
              </div>
              <Button
                type="submit"
                disabled={otpLoading || !otpConsent}
                fullWidth
                size="sm"
              >
                {otpLoading ? "..." : "Check In with OTP"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
