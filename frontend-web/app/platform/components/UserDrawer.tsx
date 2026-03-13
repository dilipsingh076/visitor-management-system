"use client";

import { useState } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Building2,
  Shield,
  Calendar,
  Clock,
  Ban,
  CheckCircle,
  Key,
  Edit2,
  Save,
} from "lucide-react";
import { useResetUserPassword, useUpdatePlatformUser } from "@/features/admin/hooks/usePlatformUsers";

interface UserData {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  flat_number: string | null;
  is_active: boolean;
  is_verified: boolean;
  role: string;
  roles: string[];
  society_id: string | null;
  building_id: string | null;
  last_login: string | null;
  created_at: string;
  society_name?: string | null;
}

interface UserDrawerProps {
  user: UserData;
  isOpen: boolean;
  onClose: () => void;
  onBlock: (id: string) => void;
  onUnblock: (id: string) => void;
  onVerify: (id: string) => void;
}

const ROLE_OPTIONS = [
  { value: "resident", label: "Resident" },
  { value: "chairman", label: "Chairman" },
  { value: "secretary", label: "Secretary" },
  { value: "treasurer", label: "Treasurer" },
  { value: "guard", label: "Security Guard" },
  { value: "platform_admin", label: "Platform Admin" },
];

const ROLE_COLORS: Record<string, string> = {
  platform_admin: "bg-purple-100 text-purple-700",
  chairman: "bg-primary/10 text-primary",
  secretary: "bg-info/10 text-info",
  treasurer: "bg-warning/10 text-warning",
  guard: "bg-muted-bg text-foreground",
  resident: "bg-success/10 text-success",
};

export function UserDrawer({
  user,
  isOpen,
  onClose,
  onBlock,
  onUnblock,
  onVerify,
}: UserDrawerProps) {
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [editingRole, setEditingRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user.role);

  const resetPasswordMutation = useResetUserPassword();
  const updateUserMutation = useUpdatePlatformUser();

  const handleResetPassword = async () => {
    if (!newPassword.trim() || newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    try {
      await resetPasswordMutation.mutateAsync({
        userId: user.id,
        newPassword: newPassword.trim(),
      });
      setShowResetPassword(false);
      setNewPassword("");
    } catch (err) {
      console.error("Failed to reset password:", err);
    }
  };

  const handleRoleChange = async () => {
    if (selectedRole === user.role) {
      setEditingRole(false);
      return;
    }
    try {
      await updateUserMutation.mutateAsync({
        id: user.id,
        data: { role: selectedRole, roles: [selectedRole] },
      });
      setEditingRole(false);
    } catch (err) {
      console.error("Failed to update role:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-card shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">User Details</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted-bg transition"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* User Info Card */}
          <div className="bg-muted-bg/50 rounded-xl p-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-foreground truncate">
                  {user.full_name || "No Name"}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-xs font-medium capitalize ${
                      ROLE_COLORS[user.role] || ROLE_COLORS.resident
                    }`}
                  >
                    {user.role.replace(/_/g, " ")}
                  </span>
                  {user.is_verified && (
                    <span className="inline-flex items-center gap-1 text-xs text-success">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Contact Information
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{user.email || "No email"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{user.phone || "No phone"}</span>
              </div>
            </div>
          </div>

          {/* Society Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Society Information
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{user.society_name || "No society"}</span>
              </div>
              {user.flat_number && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="w-4 h-4 flex items-center justify-center text-muted-foreground text-xs font-medium">
                    #
                  </span>
                  <span className="text-foreground">Flat {user.flat_number}</span>
                </div>
              )}
            </div>
          </div>

          {/* Role Management */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Role Management
            </h4>
            {editingRole ? (
              <div className="flex items-center gap-2">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm bg-muted-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleRoleChange}
                  disabled={updateUserMutation.isPending}
                  className="p-2 bg-primary text-card rounded-lg hover:bg-primary-hover disabled:opacity-50 transition"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setEditingRole(false);
                    setSelectedRole(user.role);
                  }}
                  className="p-2 border border-border rounded-lg hover:bg-muted-bg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingRole(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted-bg transition w-full"
              >
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className="flex-1 text-left capitalize">{user.role.replace(/_/g, " ")}</span>
                <Edit2 className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Timestamps */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Activity
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Joined:</span>
                <span className="text-foreground">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Last login:</span>
                <span className="text-foreground">
                  {user.last_login
                    ? new Date(user.last_login).toLocaleString()
                    : "Never"}
                </span>
              </div>
            </div>
          </div>

          {/* Reset Password */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Security
            </h4>
            {showResetPassword ? (
              <div className="space-y-2">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 text-sm bg-muted-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleResetPassword}
                    disabled={resetPasswordMutation.isPending}
                    className="flex-1 px-3 py-2 bg-primary text-card text-sm font-medium rounded-lg hover:bg-primary-hover disabled:opacity-50 transition"
                  >
                    {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
                  </button>
                  <button
                    onClick={() => {
                      setShowResetPassword(false);
                      setNewPassword("");
                    }}
                    className="px-3 py-2 border border-border text-sm rounded-lg hover:bg-muted-bg transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowResetPassword(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted-bg transition w-full"
              >
                <Key className="w-4 h-4 text-muted-foreground" />
                <span className="flex-1 text-left">Reset Password</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border space-y-2">
          {!user.is_verified && (
            <button
              onClick={() => onVerify(user.id)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-success text-card text-sm font-medium rounded-lg hover:bg-success/90 transition"
            >
              <CheckCircle className="w-4 h-4" />
              Verify User
            </button>
          )}
          {user.is_active ? (
            <button
              onClick={() => onBlock(user.id)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-error text-card text-sm font-medium rounded-lg hover:bg-error/90 transition"
            >
              <Ban className="w-4 h-4" />
              Block User
            </button>
          ) : (
            <button
              onClick={() => onUnblock(user.id)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-card text-sm font-medium rounded-lg hover:bg-primary-hover transition"
            >
              <CheckCircle className="w-4 h-4" />
              Unblock User
            </button>
          )}
        </div>
      </div>
    </>
  );
}
