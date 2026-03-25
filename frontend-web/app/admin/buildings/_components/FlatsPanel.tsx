"use client";

import { useState } from "react";
import { Button, Badge } from "@/components/ui";
import { theme } from "@/lib/theme";
import { useFlats, useCreateFlat, useBulkCreateFlats, useUpdateFlat, useRemoveResidentFromFlat } from "@/features/admin";
import { Plus, Layers, Pencil, X, Check, UserMinus } from "lucide-react";
import type { Flat } from "@/lib/types";
import { FlatMembersSection } from "./FlatMembersSection";

export function FlatsPanel({ buildingId }: { buildingId: string }) {
  const { data: flats, isLoading } = useFlats(buildingId);
  const createFlat = useCreateFlat();
  const bulkCreate = useBulkCreateFlats();
  const updateFlat = useUpdateFlat(buildingId);
  const removeResident = useRemoveResidentFromFlat(buildingId);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [expandedFlatId, setExpandedFlatId] = useState<string | null>(null);
  const [editingFlatId, setEditingFlatId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ flat_number: "", floor: "", flat_type: "", owner_name: "", occupancy_status: "" });

  // Single flat form
  const [flatForm, setFlatForm] = useState({ flat_number: "", floor: "", flat_type: "", owner_name: "" });
  // Bulk form
  const [bulkForm, setBulkForm] = useState({ total_floors: 5, units_per_floor: 4, start_floor: 1, flat_type: "" });

  const handleAddFlat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flatForm.flat_number.trim()) return;
    await createFlat.mutateAsync({
      building_id: buildingId,
      flat_number: flatForm.flat_number.trim(),
      floor: flatForm.floor ? parseInt(flatForm.floor) : undefined,
      flat_type: flatForm.flat_type || undefined,
      owner_name: flatForm.owner_name || undefined,
    });
    setFlatForm({ flat_number: "", floor: "", flat_type: "", owner_name: "" });
    setShowAddForm(false);
  };

  const handleBulkCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await bulkCreate.mutateAsync({
      building_id: buildingId,
      total_floors: bulkForm.total_floors,
      units_per_floor: bulkForm.units_per_floor,
      start_floor: bulkForm.start_floor,
      flat_type: bulkForm.flat_type || undefined,
    });
    setShowBulkForm(false);
  };

  const startEdit = (flat: Flat) => {
    setEditingFlatId(flat.id);
    setEditForm({
      flat_number: flat.flat_number,
      floor: flat.floor?.toString() ?? "",
      flat_type: flat.flat_type ?? "",
      owner_name: flat.owner_name ?? "",
      occupancy_status: flat.occupancy_status,
    });
  };

  const cancelEdit = () => setEditingFlatId(null);

  const handleSaveEdit = async () => {
    if (!editingFlatId) return;
    await updateFlat.mutateAsync({
      flatId: editingFlatId,
      data: {
        flat_number: editForm.flat_number.trim() || undefined,
        floor: editForm.floor ? parseInt(editForm.floor) : undefined,
        flat_type: editForm.flat_type || undefined,
        owner_name: editForm.owner_name || undefined,
        occupancy_status: editForm.occupancy_status || undefined,
      },
    });
    setEditingFlatId(null);
  };

  const handleRemoveResident = async (flat: Flat) => {
    if (!confirm(`Remove ${flat.registered_owner} from flat ${flat.flat_number}? They will be unlinked from this flat.`)) return;
    await removeResident.mutateAsync(flat.id);
  };

  const statusColor = (status: string) =>
    status === "occupied" ? "success" : "secondary";

  return (
    <div className="border-t border-border px-6 py-4 bg-muted-bg/30">
      {/* Actions */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-foreground">
          Flats ({flats?.length ?? 0})
        </p>
        <div className="flex gap-2">
          <Button size="xs" variant="secondary" onClick={() => { setShowAddForm(!showAddForm); setShowBulkForm(false); }}>
            <Plus className="w-3 h-3 mr-1" /> Add Flat
          </Button>
          <Button size="xs" variant="secondary" onClick={() => { setShowBulkForm(!showBulkForm); setShowAddForm(false); }}>
            <Layers className="w-3 h-3 mr-1" /> Bulk Create
          </Button>
        </div>
      </div>

      {/* Add Single Flat Form */}
      {showAddForm && (
        <form onSubmit={handleAddFlat} className="mb-4 p-3 bg-card rounded-lg border border-border space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className={theme.label}>Flat Number *</label>
              <input
                type="text" value={flatForm.flat_number}
                onChange={(e) => setFlatForm({ ...flatForm, flat_number: e.target.value })}
                className={theme.input.base} placeholder="e.g., 101" required
              />
            </div>
            <div>
              <label className={theme.label}>Floor</label>
              <input
                type="number" value={flatForm.floor}
                onChange={(e) => setFlatForm({ ...flatForm, floor: e.target.value })}
                className={theme.input.base} placeholder="e.g., 1"
              />
            </div>
            <div>
              <label className={theme.label}>Type</label>
              <select
                value={flatForm.flat_type}
                onChange={(e) => setFlatForm({ ...flatForm, flat_type: e.target.value })}
                className={theme.input.base}
              >
                <option value="">—</option>
                <option value="1BHK">1BHK</option>
                <option value="2BHK">2BHK</option>
                <option value="3BHK">3BHK</option>
                <option value="4BHK">4BHK</option>
                <option value="shop">Shop</option>
                <option value="office">Office</option>
              </select>
            </div>
            <div>
              <label className={theme.label}>Owner Name</label>
              <input
                type="text" value={flatForm.owner_name}
                onChange={(e) => setFlatForm({ ...flatForm, owner_name: e.target.value })}
                className={theme.input.base} placeholder="Optional"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button size="xs" variant="secondary" type="button" onClick={() => setShowAddForm(false)}>Cancel</Button>
            <Button size="xs" type="submit" loading={createFlat.isPending}>Add</Button>
          </div>
        </form>
      )}

      {/* Bulk Create Form */}
      {showBulkForm && (
        <form onSubmit={handleBulkCreate} className="mb-4 p-3 bg-card rounded-lg border border-border space-y-3">
          <p className="text-xs text-muted-foreground">
            Generates flat numbers like 101, 102... 201, 202... based on floors and units per floor.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className={theme.label}>Total Floors *</label>
              <input
                type="number" value={bulkForm.total_floors} min={1} max={100}
                onChange={(e) => setBulkForm({ ...bulkForm, total_floors: parseInt(e.target.value) || 1 })}
                className={theme.input.base} required
              />
            </div>
            <div>
              <label className={theme.label}>Units/Floor *</label>
              <input
                type="number" value={bulkForm.units_per_floor} min={1} max={50}
                onChange={(e) => setBulkForm({ ...bulkForm, units_per_floor: parseInt(e.target.value) || 1 })}
                className={theme.input.base} required
              />
            </div>
            <div>
              <label className={theme.label}>Start Floor</label>
              <input
                type="number" value={bulkForm.start_floor}
                onChange={(e) => setBulkForm({ ...bulkForm, start_floor: parseInt(e.target.value) || 1 })}
                className={theme.input.base}
              />
            </div>
            <div>
              <label className={theme.label}>Flat Type</label>
              <select
                value={bulkForm.flat_type}
                onChange={(e) => setBulkForm({ ...bulkForm, flat_type: e.target.value })}
                className={theme.input.base}
              >
                <option value="">—</option>
                <option value="1BHK">1BHK</option>
                <option value="2BHK">2BHK</option>
                <option value="3BHK">3BHK</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button size="xs" variant="secondary" type="button" onClick={() => setShowBulkForm(false)}>Cancel</Button>
            <Button size="xs" type="submit" loading={bulkCreate.isPending}>
              Create {bulkForm.total_floors * bulkForm.units_per_floor} Flats
            </Button>
          </div>
        </form>
      )}

      {/* Flats Table */}
      {isLoading ? (
        <div className="py-6 text-center text-sm text-muted-foreground">Loading flats...</div>
      ) : flats?.length === 0 ? (
        <div className="py-6 text-center text-sm text-muted-foreground">
          No flats yet. Add individually or use bulk create.
        </div>
      ) : (
        <div className="space-y-1">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <div className="col-span-1">Flat #</div>
            <div className="col-span-1">Floor</div>
            <div className="col-span-1">Type</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-3">Registered Owner</div>
            <div className="col-span-2">Owner Label</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          {flats?.map((flat: Flat) => (
            <div key={flat.id}>
              {editingFlatId === flat.id ? (
                /* Inline edit row */
                <div className="grid grid-cols-12 gap-2 px-3 py-2 text-sm bg-muted-bg/50 rounded-md items-center">
                  <div className="col-span-1">
                    <input
                      type="text" value={editForm.flat_number}
                      onChange={(e) => setEditForm({ ...editForm, flat_number: e.target.value })}
                      className={`${theme.input.base} text-xs py-1`}
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number" value={editForm.floor}
                      onChange={(e) => setEditForm({ ...editForm, floor: e.target.value })}
                      className={`${theme.input.base} text-xs py-1`}
                    />
                  </div>
                  <div className="col-span-1">
                    <select
                      value={editForm.flat_type}
                      onChange={(e) => setEditForm({ ...editForm, flat_type: e.target.value })}
                      className={`${theme.input.base} text-xs py-1`}
                    >
                      <option value="">—</option>
                      <option value="1BHK">1BHK</option>
                      <option value="2BHK">2BHK</option>
                      <option value="3BHK">3BHK</option>
                      <option value="4BHK">4BHK</option>
                      <option value="shop">Shop</option>
                      <option value="office">Office</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <select
                      value={editForm.occupancy_status}
                      onChange={(e) => setEditForm({ ...editForm, occupancy_status: e.target.value })}
                      className={`${theme.input.base} text-xs py-1`}
                    >
                      <option value="vacant">Vacant</option>
                      <option value="occupied">Occupied</option>
                    </select>
                  </div>
                  <div className="col-span-3 text-muted-foreground text-xs truncate">
                    {flat.registered_owner || "—"}
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text" value={editForm.owner_name}
                      onChange={(e) => setEditForm({ ...editForm, owner_name: e.target.value })}
                      className={`${theme.input.base} text-xs py-1`}
                      placeholder="Owner label"
                    />
                  </div>
                  <div className="col-span-2 flex justify-end gap-1">
                    <Button size="xs" variant="ghost" onClick={handleSaveEdit} loading={updateFlat.isPending}>
                      <Check className="w-3.5 h-3.5 text-success" />
                    </Button>
                    <Button size="xs" variant="ghost" onClick={cancelEdit}>
                      <X className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ) : (
                /* Display row */
                <button
                  type="button"
                  onClick={() => setExpandedFlatId(expandedFlatId === flat.id ? null : flat.id)}
                  className="w-full grid grid-cols-12 gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted-bg/50 transition items-center text-left"
                >
                  <div className="col-span-1 font-medium text-foreground">{flat.flat_number}</div>
                  <div className="col-span-1 text-muted-foreground">{flat.floor ?? "—"}</div>
                  <div className="col-span-1 text-muted-foreground">{flat.flat_type || "—"}</div>
                  <div className="col-span-2">
                    <Badge variant={statusColor(flat.occupancy_status)} size="sm">
                      {flat.occupancy_status}
                    </Badge>
                  </div>
                  <div className="col-span-3 text-foreground truncate">{flat.registered_owner || <span className="text-muted-foreground">—</span>}</div>
                  <div className="col-span-2 text-muted-foreground truncate">{flat.owner_name || "—"}</div>
                  <div className="col-span-2 flex justify-end gap-1">
                    {flat.registered_owner && (
                      <Button
                        size="xs" variant="ghost"
                        title={`Remove ${flat.registered_owner}`}
                        onClick={(e) => { e.stopPropagation(); handleRemoveResident(flat); }}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button
                      size="xs" variant="ghost"
                      onClick={(e) => { e.stopPropagation(); startEdit(flat); }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </button>
              )}
              {expandedFlatId === flat.id && editingFlatId !== flat.id && (
                <FlatMembersSection flatId={flat.id} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
