"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { canAccessWalkin } from "@/lib/auth";
import { useAuth } from "@/features/auth";
import { useResidents } from "@/features/residents";
import { API } from "@/lib/api/endpoints";
import { PageWrapper } from "@/components/common";
import { Input, Button, Select } from "@/components/ui";
import { theme } from "@/lib/theme";
import type { Resident } from "@/features/residents";

const PHONE_LENGTH = 10;

function normalizePhone(value: string): string {
  return value.replace(/\D/g, "").slice(-PHONE_LENGTH);
}

function residentToOption(r: Resident) {
  const towerFlat = [r.building_name, r.flat_no].filter(Boolean).join(" - ");
  return {
    value: r.id,
    label: towerFlat ? `${r.full_name} (${towerFlat})` : r.full_name,
  };
}

export default function WalkInPage() {
  const { user, loading: authLoading } = useAuth({
    requireAuth: true,
    requireRole: canAccessWalkin,
    redirectTo: "/dashboard?message=Guard+or+committee+only",
  });
  const { data: residents = [], isLoading: residentsLoading } = useResidents();

  const [hostId, setHostId] = useState("");
  useEffect(() => {
    if (residents.length > 0) {
      setHostId((prev) => (prev ? prev : residents[0].id));
    }
  }, [residents]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ id: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmedName = name.trim();
    const normalizedPhone = normalizePhone(phone);
    if (!trimmedName || normalizedPhone.length < PHONE_LENGTH) {
      setError("Name and phone are required (10 digits).");
      return;
    }
    if (!hostId) {
      setError("Select whom the visitor wants to meet.");
      return;
    }
    setSubmitting(true);
    const res = await apiClient.post<{ id: string }>(API.visitors.walkin, {
      visitor_name: trimmedName,
      visitor_phone: normalizedPhone,
      purpose: purpose.trim() || undefined,
      host_id: hostId,
    });
    setSubmitting(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    if (res.data) setSuccess(res.data);
  };

  const handleRegisterAnother = () => {
    setSuccess(null);
    setName("");
    setPhone("");
    setPurpose("");
    setHostId(residents[0]?.id ?? "");
  };

  if (!user) return null;
  if (!canAccessWalkin(user)) {
    return (
      <PageWrapper width="narrower">
        <div className={`text-center py-12 ${theme.text.muted}`}>
          <p>Registering walk-ins is for Guard or Admin only.</p>
          <p className={`mt-2 ${theme.text.body}`}>Redirecting…</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper width="narrower">
      <Link
        href="/checkin"
        className={`inline-block ${theme.button.link} mb-3 ${theme.text.mutedSmall}`}
      >
        ← Back
      </Link>

      <h1 className={`${theme.text.heading1} mb-0.5`}>
        Guard Walk-in
      </h1>
      <p className={`${theme.text.mutedSmall} mb-5`}>
        Unknown person arrived? Register details. The resident will be notified by tower & flat to approve before entry.
      </p>

      {success ? (
        <div className={`${theme.alert.base} ${theme.alert.warning} p-4`}>
          <div
            className="w-10 h-10 rounded-full bg-warning flex items-center justify-center text-white text-lg font-bold mb-3"
            aria-hidden
          >
            ⏳
          </div>
          <h2 className={`${theme.sectionTitle} text-warning mb-1`}>
            Waiting for resident approval
          </h2>
          <p className={`${theme.text.body} mb-1`}>
            Visitor <strong>{name}</strong> wants to meet the resident. They have been notified on their device.
          </p>
          <p className={`${theme.text.mutedSmall} mb-3`}>
            Once they approve, the visitor is allowed in and will appear in &quot;Currently inside&quot; on the Guard page. No OTP or extra step needed.
          </p>
          <p className={`${theme.text.mutedSmall} text-warning font-medium mb-3`}>
            Do not allow entry until resident approves.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={handleRegisterAnother} variant="secondary">
              Register another
            </Button>
            <Link
              href="/visitors?status=pending"
              className={`${theme.text.mutedSmall} text-warning font-medium hover:underline`}
            >
              View pending approvals →
            </Link>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className={`${theme.surface.card} p-4 ${theme.space.formStack}`}
        >
          {error && (
            <div
              className={theme.auth.alertError}
              role="alert"
            >
              {error}
            </div>
          )}

          <Select
            label="Visitor wants to meet *"
            value={hostId}
            onChange={(e) => setHostId(e.target.value)}
            options={[
              { value: "", label: "Select resident (tower + flat)" },
              ...residents.map(residentToOption),
            ]}
            required
          />
          <Input
            label="Visitor name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            required
          />
          <Input
            label="Phone (10 digits)"
            value={phone}
            onChange={(e) => setPhone(normalizePhone(e.target.value))}
            placeholder="9876543210"
            maxLength={PHONE_LENGTH}
            required
          />
          <Input
            label="Purpose (optional)"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="Meeting, delivery, etc."
          />

          <Button
            type="submit"
            fullWidth
            size="sm"
            disabled={submitting || residents.length === 0 || residentsLoading}
          >
            {submitting ? "Registering…" : "Register Walk-in"}
          </Button>
        </form>
      )}
    </PageWrapper>
  );
}
