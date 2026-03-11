"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { canInviteVisitor } from "@/lib/auth";
import { useAuth } from "@/features/auth";
import Link from "next/link";
import { Alert, Button, Input, Select } from "@/components/ui";
import {
  useBuildings,
  useInviteVisitor,
  type InviteVisitorResult,
} from "@/features/visitors";

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

  useEffect(() => {
    // Prefill from quick-invite (frequent visitors)
    const qpName = searchParams.get("name") ?? "";
    const qpPhone = searchParams.get("phone") ?? "";
    const qpPurpose = searchParams.get("purpose") ?? "";

    setName((prev) => (prev ? prev : qpName));
    setPhone((prev) => (prev ? prev : qpPhone.replace(/\D/g, "").slice(0, 10)));
    setPurpose((prev) => (prev ? prev : qpPurpose));
  }, [searchParams]);

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
      <div className="max-w-lg mx-auto px-4 py-10 text-center text-muted">
        <p>Inviting visitors is for Resident or Admin only.</p>
        <p className="mt-2 text-sm">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <Link href="/visitors" className="text-muted hover:text-primary mb-3 inline-block text-sm">← Back</Link>
      <h1 className="text-xl font-semibold text-foreground mb-0.5">Invite Visitor</h1>
      <p className="text-muted text-xs mb-5">Pre-approve a visitor with QR code and OTP</p>

      {result ? (
        <div className="bg-primary-muted border border-primary/30 rounded-lg p-4">
          <h2 className="text-base font-semibold text-primary mb-2">Invitation created!</h2>
          <p className="text-muted text-xs mb-2">Share with your visitor:</p>
          <div className="bg-card rounded-lg p-3 space-y-1">
            <p className="text-sm"><span className="font-medium">OTP:</span> <code className="font-mono">{result.otp}</code></p>
            {result.qr_code && <p className="text-sm"><span className="font-medium">QR:</span> {result.qr_code}</p>}
          </div>
          <Button size="sm" onClick={() => { setResult(null); setName(""); setPhone(""); setPurpose(""); setExpectedArrival(""); }} className="mt-3">
            Invite another
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-card rounded-lg border border-border p-4 space-y-3">
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
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-lg mx-auto px-4 py-10 text-muted-foreground">
          Loading…
        </div>
      }
    >
      <InviteContent />
    </Suspense>
  );
}
