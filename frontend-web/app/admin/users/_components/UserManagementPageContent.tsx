"use client";

import { useState } from "react";
import { Plus, Pencil, Ban, CheckCircle, Trash2 } from "lucide-react";
import { Avatar, Button, Input, Badge, Modal, ConfirmDialog, Select, PageHeader, EmptyState, EmptyIllustration, Alert, RoleBadge } from "@/components/ui";
import {
  useUserManagement,
  ROLE_OPTIONS,
  COMMITTEE_ROLES,
  shouldShowFlatForRole,
} from "@/features/admin";
import { PageWrapper, PageLoadingSkeleton, SearchInput } from "@/components/common";
import { theme } from "@/lib/theme";

export function UserManagementPageContent() {
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
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
      <PageWrapper width="narrow">
        <Alert variant="error" className="mb-3 text-sm">
          {listError.message}
        </Alert>
        <p className={theme.text.mutedSmall}>
          If you just registered this society, try logging out and logging in again so your session has the correct society.
        </p>
      </PageWrapper>
    );
  }

  if (isLoading) {
    return (
      <PageWrapper width="narrow">
        <PageLoadingSkeleton rows={5} showInput />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper width="narrow">
      <PageHeader
        title="Society users"
        description="Chairman and committee can assign committee roles. Resident and Guard are assigned only through signup."
        action={
          <Button size="sm" onClick={modals.openAddModal}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add User
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <div className={theme.statCard.root}>
          <p className={theme.statCard.label}>Total</p>
          <p className={theme.statCard.value}>{stats.total}</p>
        </div>
        <div className={theme.statCard.root}>
          <p className={theme.statCard.label}>Committee</p>
          <p className={theme.statCard.valueSuccess}>{stats.committee}</p>
        </div>
        <div className={theme.statCard.root}>
          <p className={theme.statCard.label}>Residents</p>
          <p className={theme.statCard.valueInfo}>{stats.residents}</p>
        </div>
        <div className={theme.statCard.root}>
          <p className={theme.statCard.label}>Guards</p>
          <p className={theme.statCard.valueWarning}>{stats.guards}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="flex-1">
          <SearchInput
            value={filters.searchQuery}
            onChange={filters.setSearchQuery}
            placeholder="Search by name, email, or flat..."
            aria-label="Search users"
          />
        </div>
        <Select
          value={filters.filterRole}
          onChange={(e) => filters.setFilterRole(e.target.value)}
          options={[{ value: "all", label: "All Roles" }, ...ROLE_OPTIONS]}
          className="w-full md:w-48"
        />
      </div>

      <div className={`${theme.list.card} shadow-[var(--shadow-sm)]`}>
        <div className={theme.table.wrap}>
          <table className="w-full">
            <thead className={theme.table.thead}>
              <tr>
                <th className={`${theme.table.th}`}>User</th>
                <th className={theme.table.th}>Role</th>
                <th className={`${theme.table.th} hidden md:table-cell`}>Flat</th>
                <th className={`${theme.table.th} hidden lg:table-cell`}>Last Login</th>
                <th className={theme.table.th}>Status</th>
                <th className={`${theme.table.th} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className={theme.table.tbody}>
              {filteredUsers.map((user) => (
                <tr key={user.id} className={theme.list.rowHoverLight}>
                  <td className={theme.table.td}>
                    <div className="flex items-center gap-2">
                      <Avatar name={user.username} size="sm" />
                      <div className="min-w-0">
                        <p className={`${theme.text.body} font-medium text-foreground truncate`}>{user.username}</p>
                        <p className={`${theme.text.mutedSmall} truncate`}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className={theme.table.td}>
                    <div className="flex flex-wrap gap-1">
                      {(user.roles ?? (user.role ? [user.role] : [])).map((role) => (
                        <RoleBadge key={role} role={role} size="sm" />
                      ))}
                    </div>
                  </td>
                  <td className={`${theme.table.td} ${theme.text.mutedSmall} hidden md:table-cell`}>{user.flat_number || "—"}</td>
                  <td className={`${theme.table.td} ${theme.text.mutedSmall} hidden lg:table-cell`}>{user.last_login || "Never"}</td>
                  <td className={theme.table.td}>
                    <Badge variant={user.status === "active" ? "success" : "default"} className="text-xs">{user.status}</Badge>
                  </td>
                  <td className={theme.table.td}>
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => modals.openEditModal(user)} aria-label="Edit user">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleStatus(user.id)}
                        title={user.status === "active" ? "Deactivate" : "Activate"}
                        aria-label={user.status === "active" ? "Deactivate" : "Activate"}
                      >
                        {user.status === "active" ? (
                          <Ban className="w-4 h-4 text-warning" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-success" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteTarget({ id: user.id, name: user.username })}
                        className="text-error hover:bg-error/10"
                        aria-label="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
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

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) handleDeleteUser(deleteTarget.id);
          setDeleteTarget(null);
        }}
        title="Delete user"
        message={deleteTarget ? `Are you sure you want to remove "${deleteTarget.name}" from the society? This cannot be undone.` : ""}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />
    </PageWrapper>
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
    <div className={theme.space.formStack}>
      {error && <p className={theme.auth.alertError}>{error}</p>}
      <div className={theme.grid.formTwoCol}>
        <div>
          <label className={theme.label}>Email *</label>
          <Input
            type="email"
            placeholder="user@example.com"
            value={form.email}
            onChange={(e) => onFieldChange("email", e.target.value)}
          />
        </div>
        <div>
          <label className={theme.label}>Full name *</label>
          <Input placeholder="Full name" value={form.username} onChange={(e) => onFieldChange("username", e.target.value)} />
        </div>
      </div>
      <div className={theme.grid.formTwoCol}>
        <div>
          <label className={theme.label}>Role *</label>
          <Select value={form.role} onChange={(e) => onFieldChange("role", e.target.value)} options={[...ROLE_OPTIONS]} />
        </div>
        <div>
          <label className={theme.label}>Password *</label>
          <Input
            type="password"
            placeholder="Min 6 characters"
            value={form.password}
            onChange={(e) => onFieldChange("password", e.target.value)}
          />
        </div>
      </div>
      <div className={theme.grid.formTwoCol}>
        <div>
          <label className={theme.label}>Phone</label>
          <Input placeholder="10-digit phone" value={form.phone} onChange={(e) => onFieldChange("phone", e.target.value)} />
        </div>
        {shouldShowFlatForRole(form.role) && (
          <div>
            <label className={theme.label}>Flat / Unit</label>
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
    <div className={theme.space.formStack}>
      {error && <p className={theme.auth.alertError}>{error}</p>}
      <div className={theme.grid.formTwoCol}>
        <div>
          <label className={theme.label}>Email</label>
          <Input type="email" value={user.email} readOnly className="bg-muted-bg" />
        </div>
        <div>
          <label className={theme.label}>Full name</label>
          <Input value={user.username} onChange={(e) => onUserChange({ username: e.target.value })} />
        </div>
      </div>
      <div>
        <label className={`${theme.label} mb-2`}>Assign committee roles</label>
        <p className={`${theme.text.mutedSmall} mb-2`}>One user can have multiple roles. Resident and Guard are assigned only through signup.</p>
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
          <p className={`${theme.text.mutedSmall} mt-2`}>
            Also has: {signupRoles.map((r) => (r === "resident" ? "Resident" : "Guard")).join(", ")} (assigned via signup)
          </p>
        )}
      </div>
      <div>
        <label className={theme.label}>Phone</label>
        <Input value={user.phone ?? ""} onChange={(e) => onUserChange({ phone: e.target.value })} />
      </div>
      {shouldShowFlatForRole(user.role) && (
        <div>
          <label className={theme.label}>Flat / Unit</label>
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
