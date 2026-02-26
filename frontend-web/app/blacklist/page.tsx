"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { isAuthenticated, getDemoUser, canAccessGuardPage } from "@/lib/auth";
import { API } from "@/lib/api/endpoints";
import { PageHeader, Button, Input } from "@/components/ui";
import type { User } from "@/lib/auth";

interface BlacklistEntry {
  visitor_id: string;
  visitor_name: string;
  visitor_phone: string;
  reason: string;
  created_at?: string;
}

export default function BlacklistPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [list, setList] = useState<BlacklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

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

  const fetchList = async () => {
    setLoading(true);
    const res = await apiClient.get<BlacklistEntry[]>(API.blacklist.list);
    setList(Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  };

  useEffect(() => {
    if (user && canAccessGuardPage(user)) fetchList();
  }, [user]);

  const handleAddByPhone = async () => {
    if (!name.trim() || phone.replace(/\D/g, "").length < 10 || !reason.trim()) return;
    setSaving(true);
    const res = await apiClient.post(API.blacklist.addByPhone, {
      visitor_name: name.trim(),
      visitor_phone: phone.replace(/\D/g, "").slice(-10),
      reason: reason.trim(),
    });
    setSaving(false);
    if (!res.error) {
      setName("");
      setPhone("");
      setReason("");
      setShowForm(false);
      fetchList();
    }
  };

  const handleRemove = async (visitorId: string) => {
    setRemoving(visitorId);
    const res = await apiClient.delete(API.blacklist.remove(visitorId));
    setRemoving(null);
    if (!res.error) fetchList();
  };

  if (!user) return null;
  if (!canAccessGuardPage(user)) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title="Blacklist"
        description="Denied visitors cannot check in or be invited. Add or remove entries (Guard or Admin only)."
        action={
          <Link href="/dashboard">
            <Button variant="secondary">← Dashboard</Button>
          </Link>
        }
      />

      <div className="mt-6 bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Blacklisted visitors</h2>
          {!showForm ? (
            <Button variant="secondary" onClick={() => setShowForm(true)}>
              + Add by phone
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => { setShowForm(false); setName(""); setPhone(""); setReason(""); }}>
              Cancel
            </Button>
          )}
        </div>

        {showForm && (
          <div className="p-4 bg-muted-bg/50 border-b border-border space-y-3">
            <Input
              placeholder="Visitor name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              placeholder="Phone (10 digits)"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              maxLength={10}
            />
            <Input
              placeholder="Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <Button
              onClick={handleAddByPhone}
              disabled={saving || !name.trim() || phone.length < 10 || !reason.trim()}
              loading={saving}
            >
              Add to blacklist
            </Button>
          </div>
        )}

        <div className="divide-y divide-border">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading…</div>
          ) : list.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No blacklisted visitors.</div>
          ) : (
            list.map((b) => (
              <div key={b.visitor_id} className="p-4 flex items-center justify-between hover:bg-muted-bg/50">
                <div>
                  <p className="font-medium text-foreground">{b.visitor_name}</p>
                  <p className="text-sm text-muted-foreground">{b.visitor_phone}</p>
                  {b.reason && <p className="text-xs text-muted-foreground mt-1">{b.reason}</p>}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-success hover:bg-success/10"
                  onClick={() => handleRemove(b.visitor_id)}
                  disabled={removing === b.visitor_id}
                >
                  {removing === b.visitor_id ? "…" : "Remove"}
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        <Link href="/guard" className="hover:text-primary">Guard desk</Link>
        {" · "}
        <Link href="/visitors" className="hover:text-primary">Visitors</Link>
      </p>
    </div>
  );
}
