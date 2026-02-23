"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getCachedUser, getPrimaryRole } from "@/lib/auth";
import { listUsers, createUser } from "@/lib/api";
import { Avatar, Button, Input, Badge, Modal, Select, PageHeader, EmptyState, EmptyIllustration } from "@/components/ui";

interface UserData {
  id: string;
  email: string;
  username: string;
  role: string;
  flat_number?: string;
  phone?: string;
  status: "active" | "inactive";
  created_at: string;
  last_login?: string;
}

const ROLE_OPTIONS = [
  { value: "resident", label: "Resident" },
  { value: "guard", label: "Guard" },
  { value: "admin", label: "Admin" },
];

export default function UserManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [newUser, setNewUser] = useState({ email: "", username: "", role: "resident", flat_number: "", phone: "", password: "" });
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    const user = getCachedUser();
    if (getPrimaryRole(user) !== "admin") {
      router.push("/dashboard");
      return;
    }

    listUsers().then((list) => {
      const mapped: UserData[] = list.map((u) => ({
        id: u.id,
        email: u.email,
        username: u.full_name || u.username,
        role: u.role,
        flat_number: u.flat_number ?? undefined,
        phone: u.phone ?? undefined,
        status: u.is_active ? "active" : "inactive",
        created_at: u.created_at ? u.created_at.split("T")[0] : "",
        last_login: u.last_login ? (u.last_login.split("T")[0] || "—") : undefined,
      }));
      setUsers(mapped);
    }).catch(() => setUsers([])).finally(() => setLoading(false));
  }, [router]);

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.username || !newUser.role) return;
    if (!newUser.password || newUser.password.length < 6) {
      setAddError("Password must be at least 6 characters");
      return;
    }
    setAddError("");
    setSaving(true);

    const { user, error } = await createUser({
      email: newUser.email,
      full_name: newUser.username,
      role: newUser.role,
      password: newUser.password,
      phone: newUser.phone || undefined,
      flat_number: newUser.flat_number || undefined,
    });

    if (error) {
      setAddError(error);
      setSaving(false);
      return;
    }
    if (user) {
      setUsers((prev) => [
        {
          id: user.id,
          email: user.email,
          username: user.full_name || user.username,
          role: user.role,
          flat_number: user.flat_number ?? undefined,
          phone: user.phone ?? undefined,
          status: "active",
          created_at: user.created_at ? user.created_at.split("T")[0] : "",
          last_login: undefined,
        },
        ...prev,
      ]);
    }
    setNewUser({ email: "", username: "", role: "resident", flat_number: "", phone: "", password: "" });
    setShowAddModal(false);
    setSaving(false);
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;
    setSaving(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    setUsers((prev) =>
      prev.map((u) => (u.id === selectedUser.id ? selectedUser : u))
    );

    setShowEditModal(false);
    setSelectedUser(null);
    setSaving(false);
  };

  const handleToggleStatus = async (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u
      )
    );
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.flat_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    const variants: Record<string, "success" | "warning" | "info"> = {
      admin: "success",
      guard: "warning",
      resident: "info",
    };
    return <Badge variant={variants[role] || "secondary"}>{role.charAt(0).toUpperCase() + role.slice(1)}</Badge>;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted-bg rounded w-48" />
          <div className="h-12 bg-muted-bg rounded" />
          <div className="h-96 bg-muted-bg rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title="User Management"
        description="Societies can have multiple managers, guards, and residents. Add them here."
        action={
          <Button onClick={() => setShowAddModal(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add User
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-muted-foreground text-sm">Total Users</p>
          <p className="text-2xl font-bold text-foreground mt-1">{users.length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-muted-foreground text-sm">Residents</p>
          <p className="text-2xl font-bold text-info mt-1">{users.filter((u) => u.role === "resident").length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-muted-foreground text-sm">Guards</p>
          <p className="text-2xl font-bold text-warning mt-1">{users.filter((u) => u.role === "guard").length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-muted-foreground text-sm">Active</p>
          <p className="text-2xl font-bold text-success mt-1">{users.filter((u) => u.status === "active").length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <Input
            placeholder="Search by name, email, or flat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          options={[
            { value: "all", label: "All Roles" },
            ...ROLE_OPTIONS,
          ]}
          className="w-full md:w-48"
        />
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted-bg/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">User</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Role</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hidden md:table-cell">Flat</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hidden lg:table-cell">Last Login</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted-bg/30 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.username} size="sm" />
                      <div>
                        <p className="font-medium text-foreground text-sm">{user.username}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                    {user.flat_number || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                    {user.last_login || "Never"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.status === "active" ? "success" : "secondary"}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowEditModal(true);
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleStatus(user.id)}
                        title={user.status === "active" ? "Deactivate" : "Activate"}
                      >
                        {user.status === "active" ? (
                          <svg className="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-error hover:bg-error/10"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <EmptyState
            icon={<EmptyIllustration className="w-16 h-16" />}
            title="No users found"
            description="Try adjusting your search or filters, or add your first user above."
          />
        )}
      </div>

      {/* Add User Modal */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setAddError(""); }} title="Add New User" size="lg">
        <div className="space-y-4">
          {addError && (
            <p className="text-sm text-error bg-error/10 px-3 py-2 rounded-lg">{addError}</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email *</label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={newUser.email}
                onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Full name *</label>
              <Input
                placeholder="Full name"
                value={newUser.username}
                onChange={(e) => setNewUser((prev) => ({ ...prev, username: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Role *</label>
              <Select
                value={newUser.role}
                onChange={(e) => setNewUser((prev) => ({ ...prev, role: e.target.value }))}
                options={ROLE_OPTIONS}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password *</label>
              <Input
                type="password"
                placeholder="Min 6 characters"
                value={newUser.password}
                onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
              <Input
                placeholder="10-digit phone"
                value={newUser.phone}
                onChange={(e) => setNewUser((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            {newUser.role === "resident" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Flat Number</label>
                <Input
                  placeholder="e.g., 101, A-201"
                  value={newUser.flat_number}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, flat_number: e.target.value }))}
                />
              </div>
            )}
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="secondary" onClick={() => { setShowAddModal(false); setAddError(""); }}>
              Cancel
            </Button>
            <Button onClick={handleAddUser} loading={saving} disabled={!newUser.email || !newUser.username || !newUser.password}>
              Add User
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit User" size="lg">
        {selectedUser && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                <Input
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Username</label>
                <Input
                  value={selectedUser.username}
                  onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Role</label>
                <Select
                  value={selectedUser.role}
                  onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                  options={ROLE_OPTIONS}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
                <Input
                  value={selectedUser.phone || ""}
                  onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })}
                />
              </div>
            </div>
            {selectedUser.role === "resident" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Flat Number</label>
                <Input
                  value={selectedUser.flat_number || ""}
                  onChange={(e) => setSelectedUser({ ...selectedUser, flat_number: e.target.value })}
                />
              </div>
            )}
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditUser} loading={saving}>
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
