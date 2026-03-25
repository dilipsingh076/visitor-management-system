"use client";

import { Suspense, useRef, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { canInviteVisitor } from "@/lib/auth";
import { useAuth } from "@/features/auth";
import Link from "next/link";
import { Alert, Button, Input, Select, PageHeader } from "@/components/ui";
import { QRCodeSVG } from "qrcode.react";
import {
  useBuildings,
  useInviteVisitor,
  type InviteVisitorResult,
} from "@/features/visitors";
import { PageWrapper } from "@/components/common";
import { theme } from "@/lib/theme";

function InviteContent() {
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth({
    requireAuth: true,
    requireRole: canInviteVisitor,
    redirectTo: "/dashboard?message=Resident+or+committee+only",
  });
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [expectedArrival, setExpectedArrival] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<InviteVisitorResult | null>(null);
  const [buildingId, setBuildingId] = useState("");

  const buildingsQ = useBuildings(user?.society_id);
  const buildings = buildingsQ.data ?? [];
  const inviteMutation = useInviteVisitor();
  const loading = inviteMutation.isPending;

  const initializedRef = useRef(false);
  
  useEffect(() => {
    if (initializedRef.current) return;
    
    const qpName = searchParams.get("name") ?? "";
    const qpPhone = searchParams.get("phone") ?? "";
    const qpPurpose = searchParams.get("purpose") ?? "";

    if (qpName || qpPhone || qpPurpose) {
      initializedRef.current = true;
      if (qpName && !name) setName(qpName);
      if (qpPhone && !phone) setPhone(qpPhone.replace(/\D/g, "").slice(0, 10));
      if (qpPurpose && !purpose) setPurpose(qpPurpose);
    }
  }, [searchParams, name, phone, purpose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !phone.trim()) {
      setError("Name and phone are required");
      return;
    }

    try {
      const data = await inviteMutation.mutateAsync({
        visitor_name: name,
        visitor_phone: phone,
        purpose,
        expected_arrival: expectedArrival
          ? new Date(expectedArrival).toISOString()
          : undefined,
        building_id: buildingId || undefined,
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create invite");
    }
  };

  if (authLoading || !user) return null;
  if (!canInviteVisitor(user)) {
    return (
      <PageWrapper width="narrower">
        <div className={`text-center py-10 ${theme.text.muted}`}>
          <p>Inviting visitors is for Resident or Admin only.</p>
          <p className={`mt-2 ${theme.text.body}`}>Redirecting...</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper width="narrower">
      <Link href="/visitors" className={`${theme.button.link} mb-3 inline-block ${theme.text.body}`}>← Back</Link>
      <PageHeader
        title="Invite Visitor"
        description="Pre-approve a visitor with QR code and OTP"
      />

      {result ? (
        <div className={`${theme.surface.card} p-5`}>
          <h2 className={`${theme.sectionTitle} text-primary mb-1`}>Invitation Created</h2>
          <p className={`${theme.text.mutedSmall} mb-4`}>Share the pass link with your visitor</p>

          {result.qr_code && (
            <div className="flex flex-col items-center mb-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <QRCodeSVG value={result.qr_code} size={220} level="M" />
              </div>
              <p className={`${theme.text.mutedSmall} mt-2`}>Scan at gate for check-in</p>
            </div>
          )}

          <div className="mb-4 text-center">
            <p className={`${theme.text.mutedSmall} mb-1`}>Share pass link</p>
            <p className="text-xs text-blue-600 break-all font-mono">
              {typeof window !== "undefined" ? `${window.location.origin}/pass/${result.id}` : `/pass/${result.id}`}
            </p>
          </div>

          <div className={`${theme.text.mutedSmall} space-y-1 mb-4`}>
            <p><span className="font-medium">Visitor:</span> {result.visitor_name}</p>
            <p><span className="font-medium">Phone:</span> {result.visitor_phone}</p>
            {result.purpose && <p><span className="font-medium">Purpose:</span> {result.purpose}</p>}
          </div>

          {result.otp && (
            <p className="text-xs text-gray-400 text-center mb-4">Backup code: {result.otp}</p>
          )}

          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => { setResult(null); setName(""); setPhone(""); setPurpose(""); setExpectedArrival(""); }} className="flex-1">
              Invite Another
            </Button>
            <Button size="sm" onClick={() => {
              const passUrl = `${window.location.origin}/pass/${result.id}`;
              navigator.clipboard?.writeText(passUrl);
            }} className="flex-1">
              Copy Link
            </Button>
            <Button size="sm" onClick={() => {
              const passUrl = `${window.location.origin}/pass/${result.id}`;
              const msg = `Hi ${result.visitor_name || ""},\n\nYou have been invited for a visit.\n\nOpen your visitor pass:\n${passUrl}\n\nShow the QR code at the gate for entry.`;
              const phone = (result.visitor_phone || "").replace(/\D/g, "");
              const waPhone = phone.length === 10 ? `91${phone}` : phone;
              window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`, "_blank");
            }} className="flex-1" style={{ backgroundColor: "#25D366", borderColor: "#25D366" }}>
              WhatsApp
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={`${theme.surface.card} p-4 ${theme.space.formStack}`}>
          {error && <Alert variant="error">{error}</Alert>}
          <Input id="name" label="Visitor name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Full name" noMargin />
          <Input id="phone" label="Phone (10 digits)" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} maxLength={10} placeholder="9876543210" noMargin />
          {buildings.length > 0 && (
            <Select
              id="building"
              label="Building / Wing (optional)"
              value={buildingId}
              onChange={(e) => setBuildingId(e.target.value)}
              options={[
                { value: "", label: "— None —" },
                ...buildings.map((b) => ({ value: b.id, label: `${b.name}${b.code ? ` (${b.code})` : ""}` })),
              ]}
            />
          )}
          <Input id="purpose" label="Purpose (optional)" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Meeting, delivery, etc." noMargin />
          <Input
            id="expectedArrival"
            type="datetime-local"
            label="Expected arrival (optional)"
            value={expectedArrival}
            onChange={(e) => setExpectedArrival(e.target.value)}
            hint="Check-in allowed ±60 min of this time"
            noMargin
          />
          <Button type="submit" disabled={loading} fullWidth size="sm">
            {loading ? "Creating..." : "Create Invitation"}
          </Button>
        </form>
      )}
    </PageWrapper>
  );
}

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <PageWrapper width="narrower">
          <p className={theme.text.muted}>Loading…</p>
        </PageWrapper>
      }
    >
      <InviteContent />
    </Suspense>
  );
}
