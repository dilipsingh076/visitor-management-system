"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  PageHeader,
  Switch,
  SettingsRow,
  Select,
  Text,
} from "@/components/ui";
import { PageWrapper } from "@/components/common/PageWrapper";
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
        <PageHeader
          title="Society Settings"
          description="Configure your society's visitor management preferences"
          action={
            <Button size="sm" onClick={handleSave} disabled={!hasChanges} loading={saving}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          }
        />

        {/* Society Info */}
        <Card variant="outlined">
          <CardHeader className={`${theme.surface.cardHeader} py-3`}>
            <span className={theme.sectionTitle}>
              <Building2 className="w-4 h-4 inline mr-2" />
              Society Information
            </span>
          </CardHeader>
          <CardContent className="py-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Text variant="label" as="p" className="mb-1">
                  Society Name
                </Text>
                <p className="font-medium text-foreground">{user?.society?.name || "—"}</p>
              </div>
              <div>
                <Text variant="label" as="p" className="mb-1">
                  Your Role
                </Text>
                <p className="font-medium capitalize text-foreground">
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
            <SettingsRow
              title="Walk-in Notifications"
              description="Notify residents when a walk-in visitor arrives for them"
              icon={<Bell className="h-4 w-4 text-muted-foreground" />}
              action={
                <Switch
                  aria-label="Walk-in Notifications"
                  checked={notifyOnWalkin}
                  onCheckedChange={(v) => {
                    setNotifyOnWalkin(v);
                    setHasChanges(true);
                  }}
                />
              }
            />
            <SettingsRow
              title="Invite Confirmations"
              description="Send confirmation when an invite is created"
              icon={<Bell className="h-4 w-4 text-muted-foreground" />}
              action={
                <Switch
                  aria-label="Invite Confirmations"
                  checked={notifyOnInvite}
                  onCheckedChange={(v) => {
                    setNotifyOnInvite(v);
                    setHasChanges(true);
                  }}
                />
              }
            />
            <SettingsRow
              title="Checkout Notifications"
              description="Notify when visitors check out"
              icon={<Bell className="h-4 w-4 text-muted-foreground" />}
              action={
                <Switch
                  aria-label="Checkout Notifications"
                  checked={notifyOnCheckout}
                  onCheckedChange={(v) => {
                    setNotifyOnCheckout(v);
                    setHasChanges(true);
                  }}
                />
              }
            />
            <SettingsRow
              title="Committee Alerts"
              description="Send alerts to committee members for important events"
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
              action={
                <Switch
                  aria-label="Committee Alerts"
                  checked={notifyCommittee}
                  onCheckedChange={(v) => {
                    setNotifyCommittee(v);
                    setHasChanges(true);
                  }}
                />
              }
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
            <SettingsRow
              title="Require Approval"
              description="All walk-in visitors require resident/committee approval"
              icon={<Shield className="h-4 w-4 text-muted-foreground" />}
              action={
                <Switch
                  aria-label="Require Approval"
                  checked={requireApproval}
                  onCheckedChange={(v) => {
                    setRequireApproval(v);
                    setHasChanges(true);
                  }}
                />
              }
            />
            <SettingsRow
              title="Auto-approve Pre-approved Visitors"
              description="Visitors with valid invites are automatically approved"
              icon={<Shield className="h-4 w-4 text-muted-foreground" />}
              action={
                <Switch
                  aria-label="Auto-approve Pre-approved Visitors"
                  checked={autoApprovePreapproved}
                  onCheckedChange={(v) => {
                    setAutoApprovePreapproved(v);
                    setHasChanges(true);
                  }}
                />
              }
            />
            <SettingsRow
              title="Allow Walk-ins"
              description="Allow visitors without prior invitation"
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
              action={
                <Switch
                  aria-label="Allow Walk-ins"
                  checked={allowWalkins}
                  onCheckedChange={(v) => {
                    setAllowWalkins(v);
                    setHasChanges(true);
                  }}
                />
              }
            />
            <SettingsRow
              title="Visitor Timeout"
              description="Auto-checkout visitors after this duration (hours)"
              icon={<Clock className="h-4 w-4 text-muted-foreground" />}
              action={
                <Select
                  id="visitor-timeout"
                  value={visitorTimeout}
                  onChange={(e) => {
                    setVisitorTimeout(e.target.value);
                    setHasChanges(true);
                  }}
                  options={[
                    { value: "4", label: "4 hours" },
                    { value: "8", label: "8 hours" },
                    { value: "12", label: "12 hours" },
                    { value: "24", label: "24 hours" },
                  ]}
                  className="min-w-[140px]"
                />
              }
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
            <SettingsRow
              title="Require OTP Verification"
              description="Visitors must verify their phone number via OTP"
              icon={<Shield className="h-4 w-4 text-muted-foreground" />}
              action={
                <Switch
                  aria-label="Require OTP Verification"
                  checked={requireOTP}
                  onCheckedChange={(v) => {
                    setRequireOTP(v);
                    setHasChanges(true);
                  }}
                />
              }
            />
            <SettingsRow
              title="Enable Blacklist"
              description="Block blacklisted visitors from entry"
              icon={
                enableBlacklist ? (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                )
              }
              action={
                <Switch
                  aria-label="Enable Blacklist"
                  checked={enableBlacklist}
                  onCheckedChange={(v) => {
                    setEnableBlacklist(v);
                    setHasChanges(true);
                  }}
                />
              }
            />
            <SettingsRow
              title="Log All Activity"
              description="Keep detailed logs of all visitor activity"
              icon={<Settings className="h-4 w-4 text-muted-foreground" />}
              action={
                <Switch
                  aria-label="Log All Activity"
                  checked={logAllActivity}
                  onCheckedChange={(v) => {
                    setLogAllActivity(v);
                    setHasChanges(true);
                  }}
                />
              }
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
