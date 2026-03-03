"use client";

import { useMemo, useState, useCallback } from "react";
import { getPrimaryRole, isSocietyAdmin } from "@/lib/auth";
import { useAuth } from "@/features/auth";
import { useAdminUsers, useCreateAdminUser, useUpdateAdminUser } from "./useAdminUsers";
import type { UserData } from "../types";
import { COMMITTEE_ROLES, DEFAULT_NEW_USER, type NewUserFormState } from "../constants";

const EMPTY_USERS: UserData[] = [];

/** Local overrides for list (optimistic toggle/delete until backend supports). */
interface ListOverrides {
  deletedIds: Set<string>;
  statusOverrides: Record<string, "active" | "inactive">;
}

export interface UserManagementFilters {
  searchQuery: string;
  filterRole: string;
  setSearchQuery: (v: string) => void;
  setFilterRole: (v: string) => void;
}

export interface UserManagementModals {
  showAddModal: boolean;
  showEditModal: boolean;
  openAddModal: () => void;
  closeAddModal: () => void;
  openEditModal: (user: UserData) => void;
  closeEditModal: () => void;
}

export interface UserManagementStats {
  total: number;
  committee: number;
  residents: number;
  guards: number;
  active: number;
}

export interface UseUserManagementReturn {
  /** Auth: loading or no user → render nothing; otherwise show content. */
  authLoading: boolean;
  authUser: ReturnType<typeof useAuth>["user"];
  /** Server state */
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  users: UserData[];
  filteredUsers: UserData[];
  stats: UserManagementStats;
  /** Filters */
  filters: UserManagementFilters;
  /** Modals */
  modals: UserManagementModals;
  selectedUser: UserData | null;
  updateSelectedUser: (patch: Partial<UserData>) => void;
  /** Add user form */
  newUserForm: NewUserFormState;
  setNewUserFormField: <K extends keyof NewUserFormState>(field: K, value: NewUserFormState[K]) => void;
  resetNewUserForm: () => void;
  addError: string;
  editError: string;
  /** Mutations */
  createMutation: ReturnType<typeof useCreateAdminUser>;
  updateMutation: ReturnType<typeof useUpdateAdminUser>;
  /** Actions */
  handleAddUser: () => Promise<void>;
  handleEditUser: () => Promise<void>;
  handleToggleStatus: (userId: string) => void;
  handleDeleteUser: (userId: string) => void;
}

function filterUsers(
  users: UserData[],
  searchQuery: string,
  filterRole: string,
  overrides: ListOverrides
): UserData[] {
  const q = searchQuery.trim().toLowerCase();
  return users
    .filter((u) => !overrides.deletedIds.has(u.id))
    .map((u) =>
      overrides.statusOverrides[u.id] != null
        ? { ...u, status: overrides.statusOverrides[u.id]! }
        : u
    )
    .filter((u) => {
      const matchesSearch =
        !q ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.flat_number?.toLowerCase().includes(q) ?? false);
      const matchesRole = filterRole === "all" || (u.roles && u.roles.includes(filterRole)) || u.role === filterRole;
      return matchesSearch && matchesRole;
    });
}

function computeStats(users: UserData[]): UserManagementStats {
  const hasRole = (u: UserData, r: string) => (u.roles && u.roles.includes(r)) || u.role === r;
  return {
    total: users.length,
    committee: users.filter((u) => COMMITTEE_ROLES.some((r) => hasRole(u, r))).length,
    residents: users.filter((u) => hasRole(u, "resident")).length,
    guards: users.filter((u) => hasRole(u, "guard")).length,
    active: users.filter((u) => u.status === "active").length,
  };
}

export function useUserManagement(): UseUserManagementReturn {
  const { user: authUser, loading: authLoading } = useAuth({
    requireAuth: true,
    requireRole: (u) => isSocietyAdmin(getPrimaryRole(u)),
    redirectTo: "/dashboard",
  });

  const { data: usersData, isLoading, isError, error } = useAdminUsers(undefined, !!authUser);
  const createMutation = useCreateAdminUser();
  const updateMutation = useUpdateAdminUser();

  const users = usersData ?? EMPTY_USERS;

  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [editError, setEditError] = useState("");
  const [addError, setAddError] = useState("");
  const [newUserForm, setNewUserForm] = useState<NewUserFormState>({ ...DEFAULT_NEW_USER });
  const [overrides, setOverrides] = useState<ListOverrides>({
    deletedIds: new Set(),
    statusOverrides: {},
  });

  const filteredUsers = useMemo(
    () => filterUsers(users, searchQuery, filterRole, overrides),
    [users, searchQuery, filterRole, overrides]
  );

  const stats = useMemo(
    () =>
      computeStats(
        users
          .filter((u) => !overrides.deletedIds.has(u.id))
          .map((u) =>
            overrides.statusOverrides[u.id] != null ? { ...u, status: overrides.statusOverrides[u.id]! } : u
          )
      ),
    [users, overrides]
  );

  const openAddModal = useCallback(() => {
    setAddError("");
    setNewUserForm({ ...DEFAULT_NEW_USER });
    setShowAddModal(true);
  }, []);

  const closeAddModal = useCallback(() => {
    setShowAddModal(false);
    setAddError("");
  }, []);

  const openEditModal = useCallback((user: UserData) => {
    setEditError("");
    setSelectedUser({ ...user });
    setShowEditModal(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setShowEditModal(false);
    setSelectedUser(null);
    setEditError("");
  }, []);

  const updateSelectedUser = useCallback((patch: Partial<UserData>) => {
    setSelectedUser((prev) => (prev ? { ...prev, ...patch } : null));
  }, []);

  const setNewUserFormField = useCallback(<K extends keyof NewUserFormState>(field: K, value: NewUserFormState[K]) => {
    setNewUserForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const resetNewUserForm = useCallback(() => {
    setNewUserForm({ ...DEFAULT_NEW_USER });
  }, []);

  const handleAddUser = useCallback(async () => {
    if (!newUserForm.email?.trim() || !newUserForm.username?.trim() || !newUserForm.role) return;
    if (!newUserForm.password || newUserForm.password.length < 6) {
      setAddError("Password must be at least 6 characters");
      return;
    }
    setAddError("");
    const result = await createMutation.mutateAsync({
      email: newUserForm.email.trim(),
      full_name: newUserForm.username.trim(),
      role: newUserForm.role,
      password: newUserForm.password,
      phone: newUserForm.phone?.trim() || undefined,
      flat_number: newUserForm.flat_number?.trim() || undefined,
    });
    if (result.error) {
      setAddError(result.error);
      return;
    }
    resetNewUserForm();
    closeAddModal();
  }, [newUserForm, createMutation, resetNewUserForm, closeAddModal]);

  const handleEditUser = useCallback(async () => {
    if (!selectedUser) return;
    setEditError("");
    const result = await updateMutation.mutateAsync({
      userId: selectedUser.id,
      body: {
        roles: selectedUser.roles ?? [selectedUser.role],
        full_name: selectedUser.username,
        phone: selectedUser.phone || undefined,
        flat_number: selectedUser.flat_number || undefined,
      },
    });
    if (result.error) {
      setEditError(result.error);
      return;
    }
    closeEditModal();
  }, [selectedUser, updateMutation, closeEditModal]);

  const handleToggleStatus = useCallback((userId: string) => {
    setOverrides((prev) => {
      const current = prev.statusOverrides[userId];
      const nextStatus = current === "inactive" ? "active" : "inactive";
      return {
        ...prev,
        statusOverrides: { ...prev.statusOverrides, [userId]: nextStatus },
      };
    });
  }, []);

  const handleDeleteUser = useCallback((userId: string) => {
    if (typeof window !== "undefined" && !window.confirm("Are you sure you want to delete this user?")) return;
    setOverrides((prev) => ({
      ...prev,
      deletedIds: new Set(prev.deletedIds).add(userId),
    }));
  }, []);

  return {
    authLoading,
    authUser,
    isLoading,
    isError,
    error: error ?? null,
    users,
    filteredUsers,
    stats,
    filters: {
      searchQuery,
      filterRole,
      setSearchQuery,
      setFilterRole,
    },
    modals: {
      showAddModal,
      showEditModal,
      openAddModal,
      closeAddModal,
      openEditModal,
      closeEditModal,
    },
    selectedUser,
    updateSelectedUser,
    newUserForm,
    setNewUserFormField,
    resetNewUserForm,
    addError,
    editError,
    createMutation,
    updateMutation,
    handleAddUser,
    handleEditUser,
    handleToggleStatus,
    handleDeleteUser,
  };
}
