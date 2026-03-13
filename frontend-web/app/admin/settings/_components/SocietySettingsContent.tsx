"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardHeader } from "@/components/ui";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { theme } from "@/lib/theme";
import { useAuthContext } from "@/features/auth";
import {
  Settings,
  Bell,
  Shield,
  Clock,
  Users,
  Building2,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";

interface SettingToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon?: React.ReactNode;
}

function SettingToggle({ label, description, checked, onChange, icon }: SettingToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-muted-bg flex items-center justify-center shrink-0 mt-0.5">
            {icon}
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-muted-bg border border-border"
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

interface SettingSelectProps {
  label: string;
  description: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  icon?: React.ReactNode;
}

function SettingSelect({ label, description, value, options, onChange, icon }: SettingSelectProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
      <div className="flex items-start gap-3 flex-1">
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-muted-bg flex items-center justify-center shrink-0 mt-0.5">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-1.5 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function SocietySettingsContent() {
  const { user } = useAuthContext();
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  // Notification Settings
  const [notifyOnWalkin, setNotifyOnWalkin] = useState(true);
  const [notifyOnInvite, setNotifyOnInvite] = useState(true);
  const [notifyOnCheckout, setNotifyOnCheckout] = useState(false);
  const [notifyCommittee, setNotifyCommittee] = useState(true);

  // Visitor Settings
  const [requireApproval, setRequireApproval] = useState(true);
  const [autoApprovePreapproved, setAutoApprovePreapproved] = useState(true);
  const [allowWalkins, setAllowWalkins] = useState(true);
  const [visitorTimeout, setVisitorTimeout] = useState("8");

  // Security Settings
  const [requireOTP, setRequireOTP] = useState(true);
  const [enableBlacklist, setEnableBlacklist] = useState(true);
  const [logAllActivity, setLogAllActivity] = useState(true);

  const handleChange = (setter: (v: boolean | string) => void, value: boolean | string) => {
    setter(value);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setHasChanges(false);
  };

  return (
    <PageWrapper width="wide">
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className={theme.text.heading2}>Society Settings</h1>
            <p className={theme.text.subtitle}>Configure your society's visitor management preferences</p>
          </div>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges}
            loading={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>

        {/* Society Info */}
        <Card variant="outlined">
          <CardHeader className={`${theme.surface.cardHeader} py-3`}>
            <span className={theme.sectionTitle}>
              <Building2 className="w-4 h-4 inline mr-2" />
              Society Information
            </span>
          </CardHeader>
          <CardContent className="py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={theme.label}>Society Name</label>
                <p className="text-foreground font-medium">{user?.society_name || "—"}</p>
              </div>
              <div>
                <label className={theme.label}>Your Role</label>
                <p className="text-foreground font-medium capitalize">
                  {user?.roles?.[0]?.replace(/_/g, " ") || "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card variant="outlined">
          <CardHeader className={`${theme.surface.cardHeader} py-3`}>
            <span className={theme.sectionTitle}>
              <Bell className="w-4 h-4 inline mr-2" />
              Notification Settings
            </span>
          </CardHeader>
          <CardContent className="py-2">
            <SettingToggle
              label="Walk-in Notifications"
              description="Notify residents when a walk-in visitor arrives for them"
              checked={notifyOnWalkin}
              onChange={(v) => handleChange(setNotifyOnWalkin, v)}
              icon={<Bell className="w-4 h-4 text-muted-foreground" />}
            />
            <SettingToggle
              label="Invite Confirmations"
              description="Send confirmation when an invite is created"
              checked={notifyOnInvite}
              onChange={(v) => handleChange(setNotifyOnInvite, v)}
              icon={<Bell className="w-4 h-4 text-muted-foreground" />}
            />
            <SettingToggle
              label="Checkout Notifications"
              description="Notify when visitors check out"
              checked={notifyOnCheckout}
              onChange={(v) => handleChange(setNotifyOnCheckout, v)}
              icon={<Bell className="w-4 h-4 text-muted-foreground" />}
            />
            <SettingToggle
              label="Committee Alerts"
              description="Send alerts to committee members for important events"
              checked={notifyCommittee}
              onChange={(v) => handleChange(setNotifyCommittee, v)}
              icon={<Users className="w-4 h-4 text-muted-foreground" />}
            />
          </CardContent>
        </Card>

        {/* Visitor Settings */}
        <Card variant="outlined">
          <CardHeader className={`${theme.surface.cardHeader} py-3`}>
            <span className={theme.sectionTitle}>
              <Users className="w-4 h-4 inline mr-2" />
              Visitor Policies
            </span>
          </CardHeader>
          <CardContent className="py-2">
            <SettingToggle
              label="Require Approval"
              description="All walk-in visitors require resident/committee approval"
              checked={requireApproval}
              onChange={(v) => handleChange(setRequireApproval, v)}
              icon={<Shield className="w-4 h-4 text-muted-foreground" />}
            />
            <SettingToggle
              label="Auto-approve Pre-approved Visitors"
              description="Visitors with valid invites are automatically approved"
              checked={autoApprovePreapproved}
              onChange={(v) => handleChange(setAutoApprovePreapproved, v)}
              icon={<Shield className="w-4 h-4 text-muted-foreground" />}
            />
            <SettingToggle
              label="Allow Walk-ins"
              description="Allow visitors without prior invitation"
              checked={allowWalkins}
              onChange={(v) => handleChange(setAllowWalkins, v)}
              icon={<Users className="w-4 h-4 text-muted-foreground" />}
            />
            <SettingSelect
              label="Visitor Timeout"
              description="Auto-checkout visitors after this duration (hours)"
              value={visitorTimeout}
              options={[
                { value: "4", label: "4 hours" },
                { value: "8", label: "8 hours" },
                { value: "12", label: "12 hours" },
                { value: "24", label: "24 hours" },
              ]}
              onChange={(v) => handleChange(setVisitorTimeout, v)}
              icon={<Clock className="w-4 h-4 text-muted-foreground" />}
            />
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card variant="outlined">
          <CardHeader className={`${theme.surface.cardHeader} py-3`}>
            <span className={theme.sectionTitle}>
              <Shield className="w-4 h-4 inline mr-2" />
              Security Settings
            </span>
          </CardHeader>
          <CardContent className="py-2">
            <SettingToggle
              label="Require OTP Verification"
              description="Visitors must verify their phone number via OTP"
              checked={requireOTP}
              onChange={(v) => handleChange(setRequireOTP, v)}
              icon={<Shield className="w-4 h-4 text-muted-foreground" />}
            />
            <SettingToggle
              label="Enable Blacklist"
              description="Block blacklisted visitors from entry"
              checked={enableBlacklist}
              onChange={(v) => handleChange(setEnableBlacklist, v)}
              icon={enableBlacklist ? <Eye className="w-4 h-4 text-muted-foreground" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
            />
            <SettingToggle
              label="Log All Activity"
              description="Keep detailed logs of all visitor activity"
              checked={logAllActivity}
              onChange={(v) => handleChange(setLogAllActivity, v)}
              icon={<Settings className="w-4 h-4 text-muted-foreground" />}
            />
          </CardContent>
        </Card>

        {/* Save Button (mobile) */}
        {hasChanges && (
          <div className="fixed bottom-4 left-4 right-4 sm:hidden">
            <Button className="w-full" onClick={handleSave} loading={saving}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
