"use client";

import { useState } from "react";
import {
  useSocietyAmenities,
  useCreateSocietyAmenity,
  useUpdateSocietyAmenity,
} from "@/features/amenities";
import { Badge, Button, Card, CardContent, CardHeader, StatCardSkeleton } from "@/components/ui";
import { PageWrapper } from "@/components/common";
import { theme } from "@/lib/theme";
import {
  Waves,
  Dumbbell,
  Home,
  TreePine,
  Car,
  Plus,
  Edit2,
  Save,
  X,
  Wrench,
  CheckCircle,
} from "lucide-react";

const AMENITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  pool: Waves,
  gym: Dumbbell,
  clubhouse: Home,
  playground: TreePine,
  parking: Car,
  garden: TreePine,
  default: Home,
};

const STATUS_OPTIONS = [
  { value: "operational", label: "Operational" },
  { value: "maintenance", label: "Under Maintenance" },
  { value: "closed", label: "Closed" },
];

function getStatusBadge(status: string) {
  const map: Record<string, { variant: "success" | "warning" | "error" | "default"; label: string }> = {
    operational: { variant: "success", label: "Operational" },
    maintenance: { variant: "warning", label: "Maintenance" },
    closed: { variant: "error", label: "Closed" },
  };
  const c = map[status] || { variant: "default" as const, label: status };
  return <Badge variant={c.variant}>{c.label}</Badge>;
}

function getIconForName(name: string) {
  const key = name.toLowerCase().replace(/\s+/g, "_");
  if (key.includes("pool")) return Waves;
  if (key.includes("gym")) return Dumbbell;
  if (key.includes("club") || key.includes("hall")) return Home;
  if (key.includes("play") || key.includes("garden") || key.includes("park")) return TreePine;
  if (key.includes("parking")) return Car;
  return AMENITY_ICONS.default;
}

export function AmenitiesPageContent() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    status: "operational",
    sort_order: 0,
  });

  const { data: amenities, isLoading, error } = useSocietyAmenities(
    statusFilter || undefined
  );
  const createMutation = useCreateSocietyAmenity();
  const updateMutation = useUpdateSocietyAmenity();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    try {
      await createMutation.mutateAsync({
        name: formData.name.trim(),
        code: formData.code.trim() || undefined,
        description: formData.description.trim() || undefined,
        status: formData.status,
        sort_order: formData.sort_order,
      });
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !formData.name.trim()) return;
    try {
      await updateMutation.mutateAsync({
        id: editingId,
        data: {
          name: formData.name.trim(),
          code: formData.code.trim() || undefined,
          description: formData.description.trim() || undefined,
          status: formData.status,
          sort_order: formData.sort_order,
        },
      });
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      status: "operational",
      sort_order: 0,
    });
    setShowForm(false);
    setEditingId(null);
  };

  const startEdit = (a: { id: string; name: string; code: string | null; description: string | null; status: string; sort_order: number }) => {
    setEditingId(a.id);
    setFormData({
      name: a.name,
      code: a.code || "",
      description: a.description || "",
      status: a.status,
      sort_order: a.sort_order,
    });
  };

  if (error) {
    return (
      <PageWrapper width="wide">
        <div className="bg-error/10 text-error px-4 py-3 rounded-lg text-sm">
          Failed to load amenities: {(error as Error).message}
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper width="wide">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className={theme.text.heading2}>Society Amenities</h1>
            <p className={theme.text.subtitle}>Manage amenities like pool, gym, clubhouse</p>
          </div>
          <Button size="sm" onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: "", code: "", description: "", status: "operational", sort_order: 0 }); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Amenity
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-card border border-border rounded-lg"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {(showForm || editingId) && (
          <Card variant="outlined">
            <CardHeader className={`${theme.surface.cardHeader} py-3`}>
              <span className={theme.sectionTitle}>{editingId ? "Edit Amenity" : "New Amenity"}</span>
            </CardHeader>
            <CardContent className="py-4">
              <form onSubmit={editingId ? handleUpdate : handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={theme.label}>Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={theme.input.base}
                      placeholder="e.g. Swimming Pool"
                      required
                    />
                  </div>
                  <div>
                    <label className={theme.label}>Code</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className={theme.input.base}
                      placeholder="e.g. POOL"
                    />
                  </div>
                </div>
                <div>
                  <label className={theme.label}>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`${theme.input.base} min-h-[80px]`}
                    placeholder="Optional description"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={theme.label}>Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className={theme.select.base}
                    >
                      {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={theme.label}>Sort order</label>
                    <input
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                      className={theme.input.base}
                      min={0}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="secondary" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
                    <Save className="w-4 h-4 mr-2" />
                    {editingId ? "Save" : "Create"}
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
        ) : amenities?.length === 0 ? (
          <Card variant="outlined" className="text-center py-12">
            <Waves className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No amenities yet</p>
            <p className="text-sm text-muted-foreground mt-1">Add an amenity to get started</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {amenities?.map((a) => {
              const Icon = getIconForName(a.name);
              return (
                <Card key={a.id} variant="outlined" className="hover:border-primary/20 transition">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{a.name}</h3>
                          {a.code && <p className="text-xs text-muted-foreground">{a.code}</p>}
                          {a.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {getStatusBadge(a.status)}
                        <Button size="xs" variant="secondary" onClick={() => startEdit(a)}>
                          <Edit2 className="w-3 h-3" />
                        </Button>
                      </div>
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
