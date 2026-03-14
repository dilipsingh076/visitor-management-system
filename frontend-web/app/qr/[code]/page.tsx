"use client";

import { useSearchParams, useParams } from "next/navigation";
import * as React from "react";
import { useMemo, useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function VisitQrPage() {
  const params = useParams<{ code: string }>();
  const search = useSearchParams();

  const qrValue = useMemo(() => {
    const fromQuery = search.get("code");
    return (fromQuery || params.code || "").trim();
  }, [params.code, search]);

  const [shareUrl, setShareUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    // Normalize so /qr/<code> is the canonical link
    if (!url.pathname.includes("/qr/")) {
      url.pathname = `/qr/${encodeURIComponent(qrValue)}`;
      url.search = "";
    }
    setShareUrl(url.toString());
  }, [qrValue]);

  const handleCopy = async () => {
    if (!shareUrl) return;
    setShareError(null);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = shareUrl;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      setShareError("Could not copy link. Please copy it manually.");
    }
  };

  const handleSystemShare = async () => {
    if (!shareUrl || typeof navigator === "undefined" || !(navigator as any).share) {
      setShareError("System share is not available on this device.");
      return;
    }
    setShareError(null);
    try {
      await (navigator as any).share({
        title: "Visitor QR Code",
        text: "Use this QR code link for check-in.",
        url: shareUrl,
      });
    } catch {
      // user cancelled or share failed; no need to show error
    }
  };

  if (!qrValue) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ maxWidth: 360, width: "100%", textAlign: "center", fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>QR code not found</h1>
          <p style={{ fontSize: 14, color: "#4b5563" }}>This link is missing a QR code value.</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#f9fafb" }}>
      <div style={{ maxWidth: 420, width: "100%", textAlign: "center", fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Visitor QR Code</h1>
        <div style={{ backgroundColor: "#ffffff", padding: 24, borderRadius: 16, boxShadow: "0 10px 30px rgba(15,23,42,0.12)" }}>
          <QRCodeSVG value={qrValue} size={240} includeMargin />
        </div>
        <p style={{ marginTop: 16, fontSize: 13, color: "#4b5563" }}>
          Show this QR code at the gate for a faster check-in.
        </p>

        {shareUrl && (
          <div style={{ marginTop: 20, textAlign: "left" }}>
            <p style={{ fontSize: 13, color: "#4b5563", marginBottom: 8 }}>Shareable link:</p>
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 12,
                padding: 12,
                border: "1px solid #e5e7eb",
                fontSize: 13,
                wordBreak: "break-all",
              }}
            >
              {shareUrl}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: 9999,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: "#4f46e5",
                  color: "#ffffff",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {copied ? "Copied!" : "Copy link"}
              </button>
              <button
                type="button"
                onClick={handleSystemShare}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: 9999,
                  border: "1px solid #4f46e5",
                  cursor: "pointer",
                  backgroundColor: "#eef2ff",
                  color: "#4f46e5",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Share…
              </button>
            </div>
            {shareError && (
              <p style={{ marginTop: 8, fontSize: 12, color: "#b91c1c" }}>
                {shareError}
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}



