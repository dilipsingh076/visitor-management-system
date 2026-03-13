"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Button, Card, CardContent, CardHeader, Badge } from "@/components/ui";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { useAuthContext } from "@/features/auth";
import { theme } from "@/lib/theme";
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Home,
  Users,
  X,
  Save,
} from "lucide-react";

interface Building {
  id: string;
  society_id: string;
  name: string;
  code: string | null;
  sort_order: number;
  is_active: boolean;
}

export function BuildingsPageContent() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const societyId = user?.society_id;

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    sort_order: 0,
  });

  const { data: buildings, isLoading, error } = useQuery({
    queryKey: ["buildings", societyId],
    queryFn: async (): Promise<Building[]> => {
      if (!societyId) return [];
      const res = await apiClient.get<Building[]>(`/buildings?society_id=${societyId}`);
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!societyId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; code: string; sort_order: number }) => {
      const res = await apiClient.post("/buildings", {
        society_id: societyId,
        name: data.name,
        code: data.code || null,
        sort_order: data.sort_order,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buildings", societyId] });
      setShowCreateForm(false);
      setFormData({ name: "", code: "", sort_order: 0 });
    },
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    await createMutation.mutateAsync(formData);
  };

  const handleEdit = (building: Building) => {
    setEditingId(building.id);
    setFormData({
      name: building.name,
      code: building.code || "",
      sort_order: building.sort_order,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: "", code: "", sort_order: 0 });
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
          Failed to load buildings: {(error as Error).message}
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper width="wide">
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className={theme.text.heading2}>Buildings</h1>
            <p className={theme.text.subtitle}>Manage buildings in your society</p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Building
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Card variant="outlined">
            <CardContent className="py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{buildings?.length ?? 0}</p>
                <p className="text-xs text-muted-foreground">Total Buildings</p>
              </div>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent className="py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Home className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {buildings?.filter((b) => b.is_active).length ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Active Buildings</p>
              </div>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent className="py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">—</p>
                <p className="text-xs text-muted-foreground">Total Flats</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <Card variant="outlined">
            <CardHeader className={`${theme.surface.cardHeader} py-3`}>
              <span className={theme.sectionTitle}>Add New Building</span>
            </CardHeader>
            <CardContent className="py-4">
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={theme.label}>Building Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={theme.input.base}
                      placeholder="e.g., Tower A, Block 1"
                      required
                    />
                  </div>
                  <div>
                    <label className={theme.label}>Building Code</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className={theme.input.base}
                      placeholder="e.g., A, B, T1"
                    />
                  </div>
                </div>
                <div className="w-32">
                  <label className={theme.label}>Sort Order</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    className={theme.input.base}
                    min={0}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="secondary" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={createMutation.isPending}>
                    <Save className="w-4 h-4 mr-2" />
                    Create Building
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Buildings List */}
        <div className="space-y-3">
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-4">
                <div className={theme.loading.page}>
                  <div className={theme.loading.line} />
                </div>
              </div>
            ))
          ) : buildings?.length === 0 ? (
            <Card variant="outlined" className="text-center py-12">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No buildings found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add a building to get started
              </p>
            </Card>
          ) : (
            buildings?.map((building) => (
              <Card
                key={building.id}
                variant="outlined"
                className="hover:border-primary/20 transition"
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground truncate">
                            {building.name}
                          </h3>
                          {building.code && (
                            <Badge variant="default">{building.code}</Badge>
                          )}
                          {!building.is_active && (
                            <Badge variant="warning">Inactive</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Sort Order: {building.sort_order}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={() => handleEdit(building)}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
