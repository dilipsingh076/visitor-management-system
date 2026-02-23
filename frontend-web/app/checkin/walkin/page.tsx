"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { listBuildings, type BuildingListItem } from "@/lib/api";
import { isAuthenticated, getDemoUser, canAccessWalkin } from "@/lib/auth";
import Link from "next/link";
import { Input, Button, Select } from "@/components/ui";
import { API } from "@/lib/api/endpoints";
import type { User } from "@/lib/auth";

interface Resident {
  id: string;
  full_name: string;
  email: string;
  flat_no: string;
}

export default function WalkInPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [hostId, setHostId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ id: string; otp?: string; host_name?: string; status?: string } | null>(null);
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
    if (user && !canAccessWalkin(user)) router.replace("/dashboard?message=Guard+or+admin+only");
  }, [user, router]);

  useEffect(() => {
    apiClient.get<Resident[]>(API.residents.list).then((r) => {
      if (r.data) setResidents(r.data);
      if (r.data?.length && !hostId) setHostId(r.data[0].id);
    });
  }, []);

  useEffect(() => {
    const u = user as User & { society_id?: string };
    if (u?.society_id) listBuildings(u.society_id).then(setBuildings);
    else setBuildings([]);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !phone.trim()) {
      setError("Name and phone are required");
      return;
    }
    if (!hostId) {
      setError("Select whom the visitor wants to meet");
      return;
    }
    setLoading(true);
    const res = await apiClient.post<{ id: string; otp?: string; host_name?: string; status?: string }>(
      API.visitors.walkin,
      {
        visitor_name: name.trim(),
        visitor_phone: phone.replace(/\D/g, "").slice(0, 10),
        purpose: purpose.trim() || undefined,
        host_id: hostId,
        building_id: buildingId || undefined,
      }
    );
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    if (res.data) setResult(res.data);
  };

  if (!isAuthenticated()) return null;
  if (user && !canAccessWalkin(user)) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10 text-center text-muted">
        <p>Registering walk-ins is for Guard or Admin only.</p>
        <p className="mt-2 text-sm">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <Link href="/checkin" className="text-muted hover:text-primary mb-4 inline-block">← Back</Link>
      <h1 className="text-2xl font-bold text-foreground mb-2">Guard Walk-in</h1>
      <p className="text-muted mb-8">
        Unknown person arrived? Register details. Resident will be notified to approve before entry.
      </p>

      {result ? (
        <div className="bg-warning-light border border-warning/30 rounded-xl p-6">
          <div className="w-12 h-12 rounded-full bg-warning flex items-center justify-center text-white text-xl font-bold mb-4">⏳</div>
          <h2 className="text-lg font-semibold text-warning mb-2">Waiting for resident approval</h2>
          <p className="text-muted mb-2">
            Visitor <strong>{name}</strong> wants to meet the resident. They have been notified on their dashboard.
          </p>
          <p className="text-muted text-sm mb-4">
            OTP for check-in after approval: <code className="font-mono bg-card px-2 py-1 rounded">{result.otp ?? "—"}</code>
          </p>
          <p className="text-warning text-sm font-medium">
            Do not allow entry until resident approves. Check status at Visitors page.
          </p>
          <Button onClick={() => { setResult(null); setName(""); setPhone(""); setPurpose(""); setHostId(residents[0]?.id || ""); }} className="mt-4">
            Register another
          </Button>
          <Link href="/visitors?status=pending" className="block mt-3 text-sm text-warning hover:underline">
            View pending approvals →
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6">
          {error && <div className="mb-4 p-3 bg-error-light text-error rounded-lg text-sm">{error}</div>}
          <Select
            label="Visitor wants to meet *"
            value={hostId}
            onChange={(e) => setHostId(e.target.value)}
            options={[
              { value: "", label: "Select resident" },
              ...residents.map((r) => ({
                value: r.id,
                label: r.flat_no ? `${r.full_name} (Flat ${r.flat_no})` : r.full_name,
              })),
            ]}
            required
          />
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
          <Button type="submit" disabled={loading || !residents.length} fullWidth>
            {loading ? "Registering..." : "Register Walk-in"}
          </Button>
        </form>
      )}
    </div>
  );
}
