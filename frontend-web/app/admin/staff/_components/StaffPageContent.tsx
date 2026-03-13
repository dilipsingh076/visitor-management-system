"use client";

import { useState } from "react";
import {
  useSocietyStaff,
  useCreateSocietyStaff,
  useUpdateSocietyStaff,
} from "@/features/staff";
import { useBuildings } from "@/features/visitors";
import { useAuthContext } from "@/features/auth";
import { Badge, Button, Card, CardContent, CardHeader, StatCardSkeleton } from "@/components/ui";
import { PageWrapper } from "@/components/common";
import { theme } from "@/lib/theme";
import {
  Users,
  Plus,
  Edit2,
  Save,
  Phone,
  Mail,
  Building2,
  Wrench,
  Shield,
  Sparkles,
} from "lucide-react";

const ROLE_OPTIONS = [
  { value: "plumber", label: "Plumber" },
  { value: "electrician", label: "Electrician" },
  { value: "housekeeping", label: "Housekeeping" },
  { value: "security", label: "Security" },
  { value: "gardener", label: "Gardener" },
  { value: "lift_technician", label: "Lift Technician" },
  { value: "painter", label: "Painter" },
  { value: "carpenter", label: "Carpenter" },
  { value: "other", label: "Other" },
];

function getRoleIcon(role: string) {
  if (role.includes("security")) return Shield;
  if (role.includes("electric") || role.includes("plumb") || role.includes("lift")) return Wrench;
  if (role.includes("housekeeping") || role.includes("gardener")) return Sparkles;
  return Users;
}

export function StaffPageContent() {
  const { user } = useAuthContext();
  const societyId = user?.society_id;

  const [roleFilter, setRoleFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    role: "plumber",
    phone: "",
    email: "",
    building_id: "",
    notes: "",
  });

  const { data: staffList, isLoading, error } = useSocietyStaff(roleFilter || undefined);
  const { data: buildings } = useBuildings(societyId ?? null);
  const createMutation = useCreateSocietyStaff();
  const updateMutation = useUpdateSocietyStaff();

  const resetForm = () => {
    setFormData({
      full_name: "",
      role: "plumber",
      phone: "",
      email: "",
      building_id: "",
      notes: "",
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name.trim()) return;
    try {
      await createMutation.mutateAsync({
        full_name: formData.full_name.trim(),
        role: formData.role,
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        building_id: formData.building_id || undefined,
        notes: formData.notes.trim() || undefined,
      });
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !formData.full_name.trim()) return;
    try {
      await updateMutation.mutateAsync({
        id: editingId,
        data: {
          full_name: formData.full_name.trim(),
          role: formData.role,
          phone: formData.phone.trim() || undefined,
          email: formData.email.trim() || undefined,
          building_id: formData.building_id || null,
          notes: formData.notes.trim() || undefined,
        },
      });
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (s: {
    id: string;
    full_name: string;
    role: string;
    phone: string | null;
    email: string | null;
    building_id: string | null;
    notes: string | null;
  }) => {
    setEditingId(s.id);
    setFormData({
      full_name: s.full_name,
      role: s.role,
      phone: s.phone || "",
      email: s.email || "",
      building_id: s.building_id || "",
      notes: s.notes || "",
    });
  };

  if (!societyId) {
    return (
      <PageWrapper width="wide">
        <div className="bg-warning/10 text-warning px-4 py-3 rounded-lg text-sm">
          You are not associated with a society.
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper width="wide">
        <div className="bg-error/10 text-error px-4 py-3 rounded-lg text-sm">
          Failed to load staff: {(error as Error).message}
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper width="wide">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className={theme.text.heading2}>Maintenance Staff</h1>
            <p className={theme.text.subtitle}>Manage plumbers, electricians, housekeeping, and more</p>
          </div>
          <Button size="sm" onClick={() => { setShowForm(true); setEditingId(null); resetForm(); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Staff
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-card border border-border rounded-lg"
          >
            <option value="">All roles</option>
            {ROLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {(showForm || editingId) && (
          <Card variant="outlined">
            <CardHeader className={`${theme.surface.cardHeader} py-3`}>
              <span className={theme.sectionTitle}>{editingId ? "Edit Staff" : "New Staff Member"}</span>
            </CardHeader>
            <CardContent className="py-4">
              <form onSubmit={editingId ? handleUpdate : handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={theme.label}>Full Name *</label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className={theme.input.base}
                      placeholder="e.g. Rajesh Kumar"
                      required
                    />
                  </div>
                  <div>
                    <label className={theme.label}>Role *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className={theme.select.base}
                    >
                      {ROLE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={theme.label}>Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={theme.input.base}
                      placeholder="10-digit number"
                    />
                  </div>
                  <div>
                    <label className={theme.label}>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={theme.input.base}
                      placeholder="optional"
                    />
                  </div>
                </div>
                <div>
                  <label className={theme.label}>Assigned Building</label>
                  <select
                    value={formData.building_id}
                    onChange={(e) => setFormData({ ...formData, building_id: e.target.value })}
                    className={theme.select.base}
                  >
                    <option value="">— None —</option>
                    {buildings?.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={theme.label}>Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className={`${theme.input.base} min-h-[60px]`}
                    placeholder="Optional notes"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="secondary" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
                    <Save className="w-4 h-4 mr-2" />
                    {editingId ? "Save" : "Add Staff"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        ) : staffList?.length === 0 ? (
          <Card variant="outlined" className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No staff added yet</p>
            <p className="text-sm text-muted-foreground mt-1">Add maintenance staff for quick contact</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {staffList?.map((s) => {
              const Icon = getRoleIcon(s.role);
              return (
                <Card key={s.id} variant="outlined" className="hover:border-primary/20 transition">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground">{s.full_name}</h3>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <Badge variant="primary" className="capitalize">
                              {s.role.replace(/_/g, " ")}
                            </Badge>
                            {s.building_name && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {s.building_name}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            {s.phone && (
                              <a href={`tel:${s.phone}`} className="flex items-center gap-1 hover:text-primary">
                                <Phone className="w-3.5 h-3.5" />
                                {s.phone}
                              </a>
                            )}
                            {s.email && (
                              <a href={`mailto:${s.email}`} className="flex items-center gap-1 hover:text-primary">
                                <Mail className="w-3.5 h-3.5" />
                                {s.email}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button size="xs" variant="secondary" onClick={() => startEdit(s)}>
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
