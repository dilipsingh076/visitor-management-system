"use client";

import { useState } from "react";
import type { BlacklistEntry } from "@/types";
import { Button, Input } from "@/components/ui";

interface BlacklistSectionProps {
  entries: BlacklistEntry[];
  loading: boolean;
  removeLoadingId: string | null;
  onAddByPhone: (payload: {
    visitor_name: string;
    visitor_phone: string;
    reason: string;
  }) => Promise<boolean>;
  onRemove: (visitorId: string) => Promise<boolean>;
}

export function BlacklistSection({
  entries,
  loading,
  removeLoadingId,
  onAddByPhone,
  onRemove,
}: BlacklistSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || phone.replace(/\D/g, "").length < 10 || !reason.trim())
      return;
    const ok = await onAddByPhone({
      visitor_name: name.trim(),
      visitor_phone: phone.replace(/\D/g, "").slice(0, 10),
      reason: reason.trim(),
    });
    if (ok) {
      setShowForm(false);
      setName("");
      setPhone("");
      setReason("");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setName("");
    setPhone("");
    setReason("");
  };

  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground mb-1">Blacklist</h2>
      <p className="text-muted-foreground text-sm mb-4">
        Denied visitors cannot check in or be invited.
      </p>

      {!showForm ? (
        <Button
          type="button"
          variant="secondary"
          className="mb-4"
          onClick={() => setShowForm(true)}
        >
          + Add to blacklist (by phone)
        </Button>
      ) : (
        <div className="mb-4 p-4 bg-muted-bg/50 rounded-xl border border-border space-y-3">
          <form onSubmit={handleSubmit} className="space-y-3">
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
            <div className="flex gap-2">
              <Button
                type="submit"
                variant="danger"
                disabled={
                  loading || !name.trim() || phone.length < 10 || !reason.trim()
                }
              >
                {loading ? "Adding…" : "Add to blacklist"}
              </Button>
              <Button type="button" variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {entries.length === 0 ? (
        <p className="py-6 text-center text-muted-foreground text-sm rounded-xl border border-border bg-card">
          No blacklisted visitors.
        </p>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                  Visitor
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                  Phone
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                  Reason
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {entries.map((b) => (
                <tr key={b.visitor_id}>
                  <td className="px-4 py-3 font-medium">{b.visitor_name}</td>
                  <td className="px-4 py-3">{b.visitor_phone}</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.reason}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onRemove(b.visitor_id)}
                      disabled={removeLoadingId === b.visitor_id}
                      className="text-sm text-success hover:underline disabled:opacity-50"
                    >
                      {removeLoadingId === b.visitor_id ? "…" : "Remove"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
