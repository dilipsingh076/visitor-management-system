"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { apiClient } from "@/lib/api";
import { canAccessWalkin } from "@/lib/auth";
import { useAuth, useAuthContext } from "@/features/auth";
import { useResidents } from "@/features/residents";
import { useBuildings } from "@/features/visitors";
import { useFlats } from "@/features/admin";
import { API } from "@/lib/api/endpoints";
import { PageWrapper } from "@/components/common";
import { Input, Button, Select, PageHeader, Alert } from "@/components/ui";
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

export function WalkInPageContent() {
  const { user } = useAuth({
    requireAuth: true,
    requireRole: canAccessWalkin,
    redirectTo: "/dashboard?message=Guard+or+committee+only",
  });
  const { user: authUser } = useAuthContext();
  const { data: residents = [], isLoading: residentsLoading } = useResidents();
  const { data: buildings } = useBuildings(authUser?.society_id);
  const [buildingId, setBuildingId] = useState("");
  const [flatId, setFlatId] = useState("");
  const { data: flats } = useFlats(buildingId || undefined);

  const [hostId, setHostId] = useState("");
  const initializedRef = useRef(false);

  const filteredResidents = useMemo(() => {
    if (!buildingId) return residents;
    let filtered = residents.filter((r) => r.building_id === buildingId);
    if (flatId) {
      filtered = filtered.filter((r) => r.flat_id === flatId);
    }
    return filtered;
  }, [residents, buildingId, flatId]);

  useEffect(() => {
    if (flatId && filteredResidents.length === 1) {
      setHostId(filteredResidents[0].id);
    }
  }, [flatId, filteredResidents]);

  useEffect(() => {
    if (residents.length > 0 && !initializedRef.current && !hostId) {
      initializedRef.current = true;
      setHostId(residents[0].id);
    }
  }, [residents, hostId]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ id: string } | null>(null);

  const handleBuildingChange = (id: string) => {
    setBuildingId(id);
    setFlatId("");
    setHostId("");
  };

  const handleFlatChange = (id: string) => {
    setFlatId(id);
    setHostId("");
  };

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
      flat_id: flatId || undefined,
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
    setBuildingId("");
    setFlatId("");
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
      <PageHeader
        title="Guard Walk-in"
        description="Unknown person arrived? Register details. The resident will be notified by tower & flat to approve before entry."
      />

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
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className={`${theme.surface.card} p-4 ${theme.space.formStack}`}
        >
          {error && (
            <Alert variant="error" className="text-sm">
              {error}
            </Alert>
          )}

          {buildings && buildings.length > 0 && (
            <div className={theme.grid.formTwoCol}>
              <Select
                label="Building / Tower"
                value={buildingId}
                onChange={(e) => handleBuildingChange(e.target.value)}
                options={[
                  { value: "", label: "All buildings" },
                  ...buildings.map((b) => ({ value: b.id, label: b.name })),
                ]}
              />
              {buildingId && flats && flats.length > 0 && (
                <Select
                  label="Flat"
                  value={flatId}
                  onChange={(e) => handleFlatChange(e.target.value)}
                  options={[
                    { value: "", label: "All flats" },
                    ...flats.map((f: { id: string; flat_number: string }) => ({
                      value: f.id,
                      label: f.flat_number,
                    })),
                  ]}
                />
              )}
            </div>
          )}

          <Select
            label="Visitor wants to meet *"
            value={hostId}
            onChange={(e) => setHostId(e.target.value)}
            options={[
              { value: "", label: "Select resident (tower + flat)" },
              ...filteredResidents.map(residentToOption),
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
            disabled={submitting || filteredResidents.length === 0 || residentsLoading}
          >
            {submitting ? "Registering…" : "Register Walk-in"}
          </Button>
        </form>
      )}
    </PageWrapper>
  );
}
