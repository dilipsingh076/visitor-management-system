"use client";

import { useState } from "react";
import Link from "next/link";
import { canAccessGuardPage } from "@/lib/auth";
import { useAuth } from "@/features/auth";
import {
  useGuardBlacklist,
  useGuardBlacklistByPhone,
  useGuardRemoveBlacklist,
} from "@/features/guard";
import type { BlacklistEntry } from "@/types";
import { PageHeader, Button, Input } from "@/components/ui";

export function BlacklistPageContent() {
  const { user, loading: authLoading } = useAuth({
    requireAuth: true,
    requireRole: canAccessGuardPage,
    redirectTo: "/dashboard?message=Guard+or+admin+only",
  });

  const { data: list = [], isLoading: listLoading } = useGuardBlacklist();
  const addByPhoneMutation = useGuardBlacklistByPhone();
  const removeMutation = useGuardRemoveBlacklist();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");

  const loading = authLoading || listLoading;
  const saving = addByPhoneMutation.isPending;
  const removing = removeMutation.isPending ? (removeMutation.variables as string) : null;

  const handleAddByPhone = async () => {
    if (!name.trim() || phone.replace(/\D/g, "").length < 10 || !reason.trim()) return;
    try {
      await addByPhoneMutation.mutateAsync({
        visitor_name: name.trim(),
        visitor_phone: phone.replace(/\D/g, "").slice(-10),
        reason: reason.trim(),
      });
      setName("");
      setPhone("");
      setReason("");
      setShowForm(false);
    } catch {
      // Error handled by mutation
    }
  };

  const handleRemove = async (visitorId: string) => {
    try {
      await removeMutation.mutateAsync(visitorId);
    } catch {
      // Error handled by mutation
    }
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
            <Button variant="secondary" onClick={() => setShowForm(true)}>+ Add by phone</Button>
          ) : (
            <Button variant="ghost" onClick={() => { setShowForm(false); setName(""); setPhone(""); setReason(""); }}>Cancel</Button>
          )}
        </div>
        {showForm && (
          <div className="p-4 bg-muted-bg/50 border-b border-border space-y-3">
            <Input placeholder="Visitor name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Phone (10 digits)" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} maxLength={10} />
            <Input placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
            <Button onClick={handleAddByPhone} disabled={saving || !name.trim() || phone.length < 10 || !reason.trim()} loading={saving}>
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
            list.map((b: BlacklistEntry) => (
              <div key={b.visitor_id} className="p-4 flex items-center justify-between hover:bg-muted-bg/50">
                <div>
                  <p className="font-medium text-foreground">{b.visitor_name}</p>
                  <p className="text-sm text-muted-foreground">{b.visitor_phone}</p>
                  {b.reason && <p className="text-xs text-muted-foreground mt-1">{b.reason}</p>}
                </div>
                <Button size="sm" variant="ghost" className="text-success hover:bg-success/10" onClick={() => handleRemove(b.visitor_id)} disabled={removing === b.visitor_id}>
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
