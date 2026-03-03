"use client";

import { Avatar, Button, Input, Badge, Modal, Select, PageHeader, EmptyState, EmptyIllustration, Alert } from "@/components/ui";
import { ROLE_LABELS } from "@/lib/auth";
import {
  useUserManagement,
  ROLE_OPTIONS,
  ROLE_BADGE_VARIANTS,
  COMMITTEE_ROLES,
  shouldShowFlatForRole,
} from "@/features/admin";

function RoleBadges({ roles }: { roles: string[] }) {
  const list = Array.isArray(roles) && roles.length > 0 ? roles : [];
  return (
    <div className="flex flex-wrap gap-1">
      {list.map((role) => {
        const variant = ROLE_BADGE_VARIANTS[role] ?? "default";
        return (
          <Badge key={role} variant={variant}>
            {ROLE_LABELS[role] ?? role}
          </Badge>
        );
      })}
    </div>
  );
}

export function UserManagementPageContent() {
  const {
    authLoading,
    authUser,
    isLoading,
    isError,
    error: listError,
    filteredUsers,
    stats,
    filters,
    modals,
    selectedUser,
    updateSelectedUser,
    newUserForm,
    setNewUserFormField,
    addError,
    editError,
    createMutation,
    updateMutation,
    handleAddUser,
    handleEditUser,
    handleToggleStatus,
    handleDeleteUser,
  } = useUserManagement();

  if (authLoading || !authUser) return null;

  if (isError && listError) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Alert variant="error" className="mb-4">
          {listError.message}
        </Alert>
        <p className="text-sm text-muted-foreground">
          If you just registered this society, try logging out and logging in again so your session has the correct society.
        </p>
      </div>
    );
  }

  if (isLoading) {
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
        title="Society users"
        description="All society users are listed below, including the Chairman. Chairman and committee can assign committee roles (Chairman, Secretary, Treasurer). Resident and Guard are assigned only through signup."
        action={
          <Button onClick={modals.openAddModal}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add User
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-muted-foreground text-sm">Total Users</p>
          <p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-muted-foreground text-sm">Committee</p>
          <p className="text-2xl font-bold text-success mt-1">{stats.committee}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-muted-foreground text-sm">Residents</p>
          <p className="text-2xl font-bold text-info mt-1">{stats.residents}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-muted-foreground text-sm">Guards</p>
          <p className="text-2xl font-bold text-warning mt-1">{stats.guards}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-muted-foreground text-sm">Active</p>
          <p className="text-2xl font-bold text-success mt-1">{stats.active}</p>
        </div>
      </div>

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
            value={filters.searchQuery}
            onChange={(e) => filters.setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={filters.filterRole}
          onChange={(e) => filters.setFilterRole(e.target.value)}
          options={[{ value: "all", label: "All Roles" }, ...ROLE_OPTIONS]}
          className="w-full md:w-48"
        />
      </div>

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
                  <td className="px-4 py-3">
                    <RoleBadges roles={user.roles ?? [user.role]} />
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{user.flat_number || "—"}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">{user.last_login || "Never"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={user.status === "active" ? "success" : "default"}>{user.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => modals.openEditModal(user)} aria-label="Edit user">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleStatus(user.id)}
                        title={user.status === "active" ? "Deactivate" : "Activate"}
                        aria-label={user.status === "active" ? "Deactivate" : "Activate"}
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
                        aria-label="Delete user"
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

      <Modal isOpen={modals.showAddModal} onClose={modals.closeAddModal} title="Add New User" size="lg">
        <AddUserForm
          form={newUserForm}
          onFieldChange={setNewUserFormField}
          error={addError}
          onCancel={modals.closeAddModal}
          onSubmit={handleAddUser}
          isSubmitting={createMutation.isPending}
        />
      </Modal>

      <Modal isOpen={modals.showEditModal} onClose={modals.closeEditModal} title="Assign role & edit user" size="lg">
        {selectedUser && (
          <EditUserForm
            user={selectedUser}
            onUserChange={updateSelectedUser}
            error={editError}
            onCancel={modals.closeEditModal}
            onSubmit={handleEditUser}
            isSubmitting={updateMutation.isPending}
          />
        )}
      </Modal>
    </div>
  );
}

/** Add user form: controlled by parent state. */
function AddUserForm({
  form,
  onFieldChange,
  error,
  onCancel,
  onSubmit,
  isSubmitting,
}: {
  form: { email: string; username: string; role: string; flat_number: string; phone: string; password: string };
  onFieldChange: (field: keyof typeof form, value: string) => void;
  error: string;
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-error bg-error/10 px-3 py-2 rounded-lg">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Email *</label>
          <Input
            type="email"
            placeholder="user@example.com"
            value={form.email}
            onChange={(e) => onFieldChange("email", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Full name *</label>
          <Input placeholder="Full name" value={form.username} onChange={(e) => onFieldChange("username", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Role *</label>
          <Select value={form.role} onChange={(e) => onFieldChange("role", e.target.value)} options={[...ROLE_OPTIONS]} />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Password *</label>
          <Input
            type="password"
            placeholder="Min 6 characters"
            value={form.password}
            onChange={(e) => onFieldChange("password", e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
          <Input placeholder="10-digit phone" value={form.phone} onChange={(e) => onFieldChange("phone", e.target.value)} />
        </div>
        {shouldShowFlatForRole(form.role) && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Flat / Unit</label>
            <Input placeholder="e.g., 101, A-201" value={form.flat_number} onChange={(e) => onFieldChange("flat_number", e.target.value)} />
          </div>
        )}
      </div>
      <div className="flex gap-2 justify-end pt-4">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={onSubmit} loading={isSubmitting} disabled={!form.email || !form.username || !form.password}>
          Add User
        </Button>
      </div>
    </div>
  );
}

/** Committee roles that Chairman can assign; Resident and Guard are signup-only. */
const COMMITTEE_ROLE_OPTIONS = ROLE_OPTIONS.filter((o) =>
  (COMMITTEE_ROLES as readonly string[]).includes(o.value)
);

/** Edit user form: assign multiple committee roles. Resident/Guard are signup-only and shown as read-only. */
function EditUserForm({
  user,
  onUserChange,
  error,
  onCancel,
  onSubmit,
  isSubmitting,
}: {
  user: { id: string; email: string; username: string; role: string; roles: string[]; phone?: string; flat_number?: string };
  onUserChange: (patch: Partial<typeof user>) => void;
  error: string;
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  const roles = user.roles ?? [user.role];
  const signupRoles = roles.filter((r) => r === "resident" || r === "guard");
  const toggleCommitteeRole = (role: string, checked: boolean) => {
    const committee = roles.filter((r) => (COMMITTEE_ROLES as readonly string[]).includes(r));
    const others = roles.filter((r) => !(COMMITTEE_ROLES as readonly string[]).includes(r));
    const newCommittee = checked ? [...committee, role] : committee.filter((x) => x !== role);
    const next = [...others, ...newCommittee];
    onUserChange({ roles: next, role: next[0] ?? user.role });
  };

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-error bg-error/10 px-3 py-2 rounded-lg">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Email</label>
          <Input type="email" value={user.email} readOnly className="bg-muted-bg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Full name</label>
          <Input value={user.username} onChange={(e) => onUserChange({ username: e.target.value })} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Assign committee roles</label>
        <p className="text-xs text-muted-foreground mb-2">One user can have multiple roles. Resident and Guard are assigned only through signup.</p>
        <div className="flex flex-wrap gap-4">
          {COMMITTEE_ROLE_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={roles.includes(opt.value)}
                onChange={(e) => toggleCommitteeRole(opt.value, e.target.checked)}
                className="rounded border-border"
              />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
        {signupRoles.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Also has: {signupRoles.map((r) => (r === "resident" ? "Resident" : "Guard")).join(", ")} (assigned via signup)
          </p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
        <Input value={user.phone ?? ""} onChange={(e) => onUserChange({ phone: e.target.value })} />
      </div>
      {shouldShowFlatForRole(user.role) && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Flat / Unit</label>
          <Input value={user.flat_number ?? ""} onChange={(e) => onUserChange({ flat_number: e.target.value })} />
        </div>
      )}
      <div className="flex gap-2 justify-end pt-4">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={onSubmit} loading={isSubmitting}>Save changes</Button>
      </div>
    </div>
  );
}
