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
    redirectTo: "/dashboard?message=Guard+or+committee+only",
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader
        title="Blacklist"
        description="Denied visitors cannot check in or be invited. Add or remove entries (Guard & Committee)."
        action={
          <Link href="/dashboard">
            <Button variant="secondary" size="sm">← Dashboard</Button>
          </Link>
        }
      />
      <div className="mt-4 bg-card rounded-lg border border-border overflow-hidden">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Blacklisted visitors</h2>
          {!showForm ? (
            <Button variant="secondary" size="sm" onClick={() => setShowForm(true)}>+ Add by phone</Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setName(""); setPhone(""); setReason(""); }}>Cancel</Button>
          )}
        </div>
        {showForm && (
          <div className="p-3 bg-muted-bg/50 border-b border-border space-y-2">
            <Input placeholder="Visitor name" value={name} onChange={(e) => setName(e.target.value)} className="text-sm" />
            <Input placeholder="Phone (10 digits)" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} maxLength={10} className="text-sm" />
            <Input placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} className="text-sm" />
            <Button size="sm" onClick={handleAddByPhone} disabled={saving || !name.trim() || phone.length < 10 || !reason.trim()} loading={saving}>
              Add to blacklist
            </Button>
          </div>
        )}
        <div className="divide-y divide-border">
          {loading ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Loading…</div>
          ) : list.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">No blacklisted visitors.</div>
          ) : (
            list.map((b: BlacklistEntry) => (
              <div key={b.visitor_id} className="p-3 flex items-center justify-between hover:bg-muted-bg/50">
                <div className="min-w-0">
                  <p className="font-medium text-sm text-foreground">{b.visitor_name}</p>
                  <p className="text-xs text-muted-foreground">{b.visitor_phone}</p>
                  {b.reason && <p className="text-xs text-muted-foreground mt-0.5 truncate">{b.reason}</p>}
                </div>
                <Button size="sm" variant="ghost" className="text-success hover:bg-success/10 shrink-0" onClick={() => handleRemove(b.visitor_id)} disabled={removing === b.visitor_id}>
                  {removing === b.visitor_id ? "…" : "Remove"}
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        <Link href="/guard" className="hover:text-primary">Guard desk</Link>
        {" · "}
        <Link href="/visitors" className="hover:text-primary">Visitors</Link>
      </p>
    </div>
  );
}
