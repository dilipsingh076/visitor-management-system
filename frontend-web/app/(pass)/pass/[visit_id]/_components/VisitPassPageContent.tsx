"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { StatusBadge } from "@/components/common";

const QRCodeSVG = dynamic(
  () => import("qrcode.react").then((mod) => mod.QRCodeSVG),
  {
    ssr: false,
    loading: () => (
      <div className="h-[250px] w-[250px] bg-muted-bg rounded animate-pulse" />
    ),
  }
);

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface PassData {
  visit_id: string;
  visitor_name: string;
  visitor_phone?: string;
  purpose?: string;
  host_name?: string;
  status: string;
  expected_arrival?: string;
  qr_code?: string;
}

export function VisitPassPageContent() {
  const params = useParams();
  const visitId = params.visit_id as string;

  const [pass, setPass] = useState<PassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!visitId) return;

    fetch(`${API_BASE_URL}/public/pass/${visitId}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.detail || "Failed to load pass");
        }
        return res.json();
      })
      .then((data) => setPass(data))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load pass")
      )
      .finally(() => setLoading(false));
  }, [visitId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3" />
          <p className="text-muted text-sm">Loading your pass...</p>
        </div>
      </div>
    );
  }

  if (error || !pass) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="bg-card rounded-2xl shadow-lg border border-border p-6 max-w-sm w-full text-center">
          <div className="text-4xl mb-3">!</div>
          <h1 className="text-lg font-semibold text-foreground mb-1">
            Pass Not Found
          </h1>
          <p className="text-sm text-muted">
            {error || "This pass link may be invalid or expired."}
          </p>
        </div>
      </div>
    );
  }

  const isCheckedIn = pass.status === "checked_in";
  const isCheckedOut = pass.status === "checked_out";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="bg-card rounded-2xl shadow-lg border border-border max-w-sm w-full overflow-hidden">
        <div className="bg-primary text-white px-6 py-4 text-center">
          <h1 className="text-lg font-semibold">Visitor Pass</h1>
          <p className="text-white/70 text-xs mt-0.5">
            Show this at the gate for entry
          </p>
        </div>

        <div className="p-6">
          <div className="flex justify-center mb-4">
            <StatusBadge status={pass.status} />
          </div>

          {isCheckedIn && (
            <div className="bg-info-light border border-info/20 rounded-lg p-3 mb-4 text-center">
              <p className="text-info text-sm font-medium">
                Already checked in
              </p>
            </div>
          )}
          {isCheckedOut && (
            <div className="bg-muted-bg border border-border rounded-lg p-3 mb-4 text-center">
              <p className="text-muted text-sm font-medium">
                Visit completed
              </p>
            </div>
          )}

          {pass.qr_code && !isCheckedOut && (
            <div className="flex flex-col items-center mb-5">
              <div className="bg-white p-3 rounded-lg border border-border">
                <QRCodeSVG value={pass.qr_code} size={250} level="M" />
              </div>
              {!isCheckedIn && (
                <p className="text-muted-foreground text-xs mt-2">
                  Show this QR code at the gate
                </p>
              )}
            </div>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Visitor</span>
              <span className="font-medium text-foreground">
                {pass.visitor_name}
              </span>
            </div>
            {pass.visitor_phone && (
              <div className="flex justify-between">
                <span className="text-muted">Phone</span>
                <span className="text-foreground">{pass.visitor_phone}</span>
              </div>
            )}
            {pass.purpose && (
              <div className="flex justify-between">
                <span className="text-muted">Purpose</span>
                <span className="text-foreground">{pass.purpose}</span>
              </div>
            )}
            {pass.host_name && (
              <div className="flex justify-between">
                <span className="text-muted">Host</span>
                <span className="text-foreground">{pass.host_name}</span>
              </div>
            )}
            {pass.expected_arrival && (
              <div className="flex justify-between">
                <span className="text-muted">Expected</span>
                <span className="text-foreground">
                  {new Date(pass.expected_arrival).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
