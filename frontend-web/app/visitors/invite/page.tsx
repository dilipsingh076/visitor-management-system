"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { listBuildings, type BuildingListItem } from "@/lib/api";
import { isAuthenticated, getDemoUser, canInviteVisitor } from "@/lib/auth";
import Link from "next/link";
import { Input, Button } from "@/components/ui";
import { API } from "@/lib/api/endpoints";
import type { User } from "@/lib/auth";

export default function InvitePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [expectedArrival, setExpectedArrival] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ otp: string; qr_code: string } | null>(null);
  const [buildings, setBuildings] = useState<BuildingListItem[]>([]);
  const [buildingId, setBuildingId] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    const demo = getDemoUser();
    if (demo) setUser(demo);
    else apiClient.get<User>(API.auth.me).then((r) => r.data && setUser(r.data));
  }, [router]);

  useEffect(() => {
    if (user && !canInviteVisitor(user)) router.replace("/dashboard?message=Resident+or+admin+only");
  }, [user, router]);

  useEffect(() => {
    const uid = user as User & { society_id?: string };
    if (uid?.society_id) listBuildings(uid.society_id).then(setBuildings);
    else setBuildings([]);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !phone.trim()) {
      setError("Name and phone are required");
      return;
    }
    setLoading(true);
    const payload: Record<string, unknown> = {
      visitor_name: name.trim(),
      visitor_phone: phone.replace(/\D/g, "").slice(0, 10),
      purpose: purpose.trim() || undefined,
    };
    if (expectedArrival) payload.expected_arrival = new Date(expectedArrival).toISOString();
    if (buildingId) payload.building_id = buildingId;
    const res = await apiClient.post<{ otp: string; qr_code: string }>(API.visitors.invite, payload);
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    if (res.data) setResult(res.data);
  };

  if (!isAuthenticated()) return null;
  if (user && !canInviteVisitor(user)) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10 text-center text-muted">
        <p>Inviting visitors is for Resident or Admin only.</p>
        <p className="mt-2 text-sm">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <Link href="/visitors" className="text-muted hover:text-primary mb-4 inline-block">← Back</Link>
      <h1 className="text-2xl font-bold text-foreground mb-2">Invite Visitor</h1>
      <p className="text-muted mb-8">Pre-approve a visitor with QR code and OTP</p>

      {result ? (
        <div className="bg-primary-muted border border-primary/30 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">Invitation created!</h2>
          <p className="text-muted mb-2">Share with your visitor:</p>
          <div className="bg-card rounded-lg p-4 space-y-2">
            <p><span className="font-medium">OTP:</span> <code className="text-lg font-mono">{result.otp}</code></p>
            {result.qr_code && <p><span className="font-medium">QR:</span> {result.qr_code}</p>}
          </div>
          <Button onClick={() => { setResult(null); setName(""); setPhone(""); setPurpose(""); setExpectedArrival(""); }} className="mt-4">
            Invite another
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6">
          {error && <div className="mb-4 p-3 bg-error-light text-error rounded-lg text-sm">{error}</div>}
          <Input label="Visitor name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Full name" />
          <Input label="Phone (10 digits)" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} maxLength={10} placeholder="9876543210" />
          {buildings.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Building / Wing (optional)</label>
              <select
                value={buildingId}
                onChange={(e) => setBuildingId(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              >
                <option value="">— None —</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}{b.code ? ` (${b.code})` : ""}</option>
                ))}
              </select>
            </div>
          )}
          <Input label="Purpose (optional)" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Meeting, delivery, etc." />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Expected arrival (optional)</label>
            <input
              type="datetime-local"
              value={expectedArrival}
              onChange={(e) => setExpectedArrival(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            />
            <p className="text-xs text-muted">Check-in allowed ±60 min of this time</p>
          </div>
          <Button type="submit" disabled={loading} fullWidth>
            {loading ? "Creating..." : "Create Invitation"}
          </Button>
        </form>
      )}
    </div>
  );
}
