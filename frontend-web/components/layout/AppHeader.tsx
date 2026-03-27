"use client";

import { Menu } from "lucide-react";
import { AlertTriangle } from "lucide-react";
import { useMemo, useState } from "react";
import {
  removeToken,
  getPrimaryRole,
  ROLE_LABELS,
  getRoleResponsibility,
} from "@/lib/auth";
import { Badge, Button, Modal, Select, Alert } from "@/components/ui";
import { NotificationBell } from "./NotificationBell";
import type { User } from "@/features/auth/types";
import { createSos, type SosType } from "@/features/sos";

interface AppHeaderProps {
  user: User;
  onMenuClick: () => void;
}

export function AppHeader({ user, onMenuClick }: AppHeaderProps) {
  const roleLabel =
    ROLE_LABELS[getPrimaryRole(user)] ?? getPrimaryRole(user);
  const hasSociety = Boolean((user as any)?.society_id);

  const sosTypeOptions = useMemo(
    () => [
      { value: "medical", label: "Medical" },
      { value: "fire", label: "Fire" },
      { value: "theft", label: "Theft" },
      { value: "lift", label: "Lift emergency" },
      { value: "other", label: "Other" },
    ],
    []
  );

  const [sosOpen, setSosOpen] = useState(false);
  const [sosType, setSosType] = useState<SosType>("medical");
  const [sosNote, setSosNote] = useState("");
  const [sosError, setSosError] = useState("");
  const [sosSuccess, setSosSuccess] = useState("");
  const [sosSending, setSosSending] = useState(false);

  const handleLogout = () => {
    removeToken();
    window.location.href = "/";
  };

  const closeSos = () => {
    if (sosSending) return;
    setSosOpen(false);
    setSosError("");
    setSosSuccess("");
  };

  const handleSendSos = async () => {
    setSosError("");
    setSosSuccess("");
    if (!hasSociety) {
      setSosError("SOS is available only for users linked to a society.");
      return;
    }
    setSosSending(true);
    try {
      await createSos({ type: sosType, note: sosNote.trim() || undefined });
      setSosSuccess("SOS alert sent to your society.");
      setSosNote("");
      // Keep modal open briefly so user sees confirmation
      window.setTimeout(() => {
        setSosOpen(false);
        setSosSuccess("");
      }, 900);
    } catch (e) {
      setSosError(e instanceof Error ? e.message : "Failed to send SOS");
    } finally {
      setSosSending(false);
    }
  };

  return (
    <header className="h-14 flex items-center justify-between px-4 lg:px-6 bg-card/95 border-b border-border/60 backdrop-blur-md shadow-[var(--shadow-header)] z-30">
      {/* Left: mobile menu + breadcrumb area */}
      <button
        type="button"
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted-bg md:hidden"
        aria-label="Open navigation"
        onClick={onMenuClick}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Spacer on desktop (sidebar has the logo) */}
      <div className="hidden md:block" />

      {/* Right: bell + user info + logout */}
      <div className="flex items-center gap-2 sm:gap-3">
        <NotificationBell user={user} />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setSosOpen(true)}
          className="h-9 w-9 rounded-xl text-red-600 hover:text-red-600 hover:bg-red-600/10 transition-colors"
          aria-label="SOS"
          title="SOS"
        >
          <AlertTriangle className="w-5 h-5 text-red-600" aria-hidden />
        </Button>
        <span className="hidden sm:inline-flex items-center gap-2 text-sm text-muted-foreground max-w-[14rem] truncate">
          <span className="text-foreground font-medium truncate">{user.username}</span>
          <Badge
            variant="primary"
            size="sm"
            title={getRoleResponsibility(getPrimaryRole(user))}
          >
            {roleLabel}
          </Badge>
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>

      <Modal
        isOpen={sosOpen}
        onClose={closeSos}
        title="SOS alert"
        size="sm"
        showCloseButton={!sosSending}
        containerClassName="items-start pt-16 sm:pt-20"
      >
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            This will notify everyone in your society immediately.
          </p>

          {sosError && <Alert variant="error">{sosError}</Alert>}
          {sosSuccess && <Alert variant="success">{sosSuccess}</Alert>}

          <Select
            id="sosType"
            label="Emergency type"
            value={sosType}
            onChange={(e) => setSosType(e.target.value as SosType)}
            options={sosTypeOptions}
            disabled={sosSending}
          />

          <div>
            <label htmlFor="sosNote" className="block text-sm font-medium text-foreground mb-1">
              Message (optional)
            </label>
            <textarea
              id="sosNote"
              value={sosNote}
              onChange={(e) => setSosNote(e.target.value)}
              placeholder="Add details (building/flat, what happened, help needed)…"
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition text-sm resize-y"
              disabled={sosSending}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={closeSos} disabled={sosSending}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleSendSos} loading={sosSending}>
              Send SOS
            </Button>
          </div>
        </div>
      </Modal>
    </header>
  );
}
