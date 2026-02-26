"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { isAuthenticated, getDemoUser, canAccessGuardPage } from "@/lib/auth";
import Link from "next/link";
import { API } from "@/lib/api/endpoints";
import type { User } from "@/lib/auth";

interface Visit {
  id: string;
  visitor_id?: string;
  visitor_name: string;
  visitor_phone: string;
  host_name: string;
  status: string;
  purpose?: string;
  otp?: string;
  is_walkin?: boolean;
  created_at: string;
}

interface BlacklistEntry {
  visitor_id: string;
  visitor_name: string;
  visitor_phone: string;
  reason: string;
  created_at: string;
}

export default function GuardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [pending, setPending] = useState<Visit[]>([]);
  const [approved, setApproved] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

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
    if (user && !canAccessGuardPage(user)) {
      router.replace("/dashboard?message=Guard+or+admin+only");
      return;
    }
  }, [user, router]);

  const [checkedIn, setCheckedIn] = useState<Visit[]>([]);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([]);
  const [showBlacklistForm, setShowBlacklistForm] = useState(false);
  const [blName, setBlName] = useState("");
  const [blPhone, setBlPhone] = useState("");
  const [blReason, setBlReason] = useState("");
  const [blacklisting, setBlacklisting] = useState(false);
  const [removingBl, setRemovingBl] = useState<string | null>(null);

  const fetchAll = async () => {
    const [pRes, aRes, cRes, blRes] = await Promise.all([
      apiClient.get<Visit[]>(`${API.visitors.list}?status=pending`),
      apiClient.get<Visit[]>(`${API.visitors.list}?status=approved`),
      apiClient.get<Visit[]>(`${API.visitors.list}?status=checked_in`),
      apiClient.get<BlacklistEntry[]>(API.blacklist.list),
    ]);
    setPending(Array.isArray(pRes.data) ? pRes.data : []);
    setApproved(Array.isArray(aRes.data) ? aRes.data : []);
    setCheckedIn(Array.isArray(cRes.data) ? cRes.data : []);
    setBlacklist(Array.isArray(blRes.data) ? blRes.data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000); // Live refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleCheckout = async (visitId: string) => {
    setCheckingOut(visitId);
    const res = await apiClient.post(API.checkin.checkout, { visit_id: visitId });
    setCheckingOut(null);
    if (!res.error) fetchAll();
  };

  const handleBlacklistByPhone = async () => {
    if (!blName.trim() || !blPhone.trim() || !blReason.trim()) return;
    setBlacklisting(true);
    const res = await apiClient.post(API.blacklist.addByPhone, {
      visitor_name: blName.trim(),
      visitor_phone: blPhone.replace(/\D/g, "").slice(0, 10),
      reason: blReason.trim(),
    });
    setBlacklisting(false);
    if (!res.error) {
      setShowBlacklistForm(false);
      setBlName("");
      setBlPhone("");
      setBlReason("");
      fetchAll();
    }
  };

  const handleBlacklistVisitor = async (visitorId: string) => {
    if (!confirm("Add this visitor to blacklist? They will not be able to check in.")) return;
    setBlacklisting(true);
    const res = await apiClient.post(API.blacklist.add, {
      visitor_id: visitorId,
      reason: "Blacklisted from guard dashboard",
    });
    setBlacklisting(false);
    if (!res.error) fetchAll();
  };

  const handleRemoveBlacklist = async (visitorId: string) => {
    setRemovingBl(visitorId);
    const res = await apiClient.delete(API.blacklist.remove(visitorId));
    setRemovingBl(null);
    if (!res.error) fetchAll();
  };

  const handleExportMuster = async () => {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const res = await fetch(`${base}/dashboard/muster?format=csv`, {
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `muster_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isAuthenticated()) return null;
  if (user && !canAccessGuardPage(user)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center text-muted">
        <p>Access denied. This page is for Guard or Admin only.</p>
        <p className="mt-2 text-sm">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Guard Dashboard</h1>
          <p className="text-muted">Walk-ins and visit status at the gate</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportMuster}
            className="px-4 py-2 bg-muted-bg text-foreground rounded-lg hover:bg-border border border-border"
          >
            Export Muster (CSV)
          </button>
          <Link href="/checkin/walkin" className="px-4 py-2 bg-warning text-white rounded-lg hover:bg-warning-hover">
            + Register Walk-in
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : (
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-semibold text-warning mb-3">⏳ Waiting for resident approval</h2>
            <p className="text-muted text-sm mb-4">Do not allow entry. Resident has been notified on their dashboard.</p>
            {pending.length === 0 ? (
              <p className="text-muted-foreground py-4">No pending walk-ins</p>
            ) : (
              <div className="bg-warning-light rounded-xl border border-warning/30 overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-warning-light">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-warning">Visitor</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-warning">Wants to meet</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-warning">Purpose</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-warning">Phone</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-warning"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {pending.map((v) => (
                      <tr key={v.id}>
                        <td className="px-4 py-3 font-medium">{v.visitor_name}</td>
                        <td className="px-4 py-3">{v.host_name || "—"}</td>
                        <td className="px-4 py-3">{v.purpose || "—"}</td>
                        <td className="px-4 py-3">{v.visitor_phone}</td>
                        <td className="px-4 py-3">
                          {v.visitor_id && (
                            <button
                              onClick={() => handleBlacklistVisitor(v.visitor_id!)}
                              disabled={blacklisting}
                              className="px-2 py-1 text-xs text-error hover:underline"
                            >
                              Blacklist
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-success mb-3">✓ Approved – allow entry</h2>
            <p className="text-muted text-sm mb-4">Resident approved. Visitor can check in with OTP below.</p>
            {approved.length === 0 ? (
              <p className="text-muted-foreground py-4">No approved visits waiting</p>
            ) : (
              <div className="bg-success-light rounded-xl border border-success/30 overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-success-light">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-success">Visitor</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-success">Host</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-success">OTP</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-success">Purpose</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-success"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {approved.map((v) => (
                      <tr key={v.id}>
                        <td className="px-4 py-3 font-medium">{v.visitor_name}</td>
                        <td className="px-4 py-3">{v.host_name || "—"}</td>
                        <td className="px-4 py-3 font-mono font-bold">{v.otp || "—"}</td>
                        <td className="px-4 py-3">{v.purpose || "—"}</td>
                        <td className="px-4 py-3">
                          {v.visitor_id && (
                            <button
                              onClick={() => handleBlacklistVisitor(v.visitor_id!)}
                              disabled={blacklisting}
                              className="px-2 py-1 text-xs text-error hover:underline"
                            >
                              Blacklist
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-primary mb-3">📍 Currently inside</h2>
            <p className="text-muted text-sm mb-4">Visitors checked in. Use Check-out when they leave.</p>
            {checkedIn.length === 0 ? (
              <p className="text-muted-foreground py-4">No visitors currently inside</p>
            ) : (
              <div className="bg-primary-muted rounded-xl border border-primary/30 overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-primary-muted">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-primary">Visitor</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-primary">Host</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-primary">Purpose</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-primary">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {checkedIn.map((v) => (
                      <tr key={v.id}>
                        <td className="px-4 py-3 font-medium">{v.visitor_name}</td>
                        <td className="px-4 py-3">{v.host_name || "—"}</td>
                        <td className="px-4 py-3">{v.purpose || "—"}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleCheckout(v.id)}
                            disabled={checkingOut === v.id}
                            className="px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover disabled:opacity-50"
                          >
                            {checkingOut === v.id ? "..." : "Check-out"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">🚫 Blacklist</h2>
            <p className="text-muted text-sm mb-4">Denied visitors. Cannot check in or be invited.</p>
            {!showBlacklistForm ? (
              <button
                onClick={() => setShowBlacklistForm(true)}
                className="mb-4 px-4 py-2 bg-muted-bg text-foreground rounded-lg hover:bg-border border border-border"
              >
                + Add to blacklist (by phone)
              </button>
            ) : (
              <div className="mb-4 p-4 bg-muted-bg rounded-xl border border-border space-y-3">
                <input
                  placeholder="Visitor name"
                  value={blName}
                  onChange={(e) => setBlName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                />
                <input
                  placeholder="Phone (10 digits)"
                  value={blPhone}
                  onChange={(e) => setBlPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  maxLength={10}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                />
                <input
                  placeholder="Reason"
                  value={blReason}
                  onChange={(e) => setBlReason(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleBlacklistByPhone}
                    disabled={blacklisting || !blName.trim() || blPhone.length < 10 || !blReason.trim()}
                    className="px-4 py-2 bg-error text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {blacklisting ? "..." : "Add to blacklist"}
                  </button>
                  <button
                    onClick={() => { setShowBlacklistForm(false); setBlName(""); setBlPhone(""); setBlReason(""); }}
                    className="px-4 py-2 bg-muted-bg rounded-lg hover:bg-border"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {blacklist.length === 0 ? (
              <p className="text-muted-foreground py-4">No blacklisted visitors</p>
            ) : (
              <div className="bg-muted-bg rounded-xl border border-border overflow-hidden">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted">Visitor</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted">Phone</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted">Reason</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {blacklist.map((b) => (
                      <tr key={b.visitor_id}>
                        <td className="px-4 py-3 font-medium">{b.visitor_name}</td>
                        <td className="px-4 py-3">{b.visitor_phone}</td>
                        <td className="px-4 py-3 text-muted">{b.reason}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleRemoveBlacklist(b.visitor_id)}
                            disabled={removingBl === b.visitor_id}
                            className="px-3 py-1.5 text-sm text-success hover:underline disabled:opacity-50"
                          >
                            {removingBl === b.visitor_id ? "..." : "Remove"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 flex gap-3">
        <Link href="/visitors" className="text-muted hover:text-primary">View all visitors →</Link>
        <Link href="/checkin" className="text-muted hover:text-primary">Check-in (OTP/QR) →</Link>
      </div>
    </div>
  );
}
