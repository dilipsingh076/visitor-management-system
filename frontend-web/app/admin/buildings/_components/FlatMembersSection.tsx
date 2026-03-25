"use client";

import { useState } from "react";
import { Button, Badge } from "@/components/ui";
import { theme } from "@/lib/theme";
import { useFlatMembers, useAddFlatMember, useRemoveFlatMember } from "@/features/admin";
import { Plus, Trash2, UserPlus } from "lucide-react";

const RELATION_OPTIONS = [
  { value: "spouse", label: "Spouse" },
  { value: "parent", label: "Parent" },
  { value: "child", label: "Child" },
  { value: "sibling", label: "Sibling" },
  { value: "other", label: "Other" },
];

export function FlatMembersSection({ flatId }: { flatId: string }) {
  const { data: members, isLoading } = useFlatMembers(flatId);
  const addMember = useAddFlatMember(flatId);
  const removeMember = useRemoveFlatMember(flatId);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    relation: "spouse",
    date_of_birth: "",
    id_proof_type: "",
    id_proof_number: "",
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim()) return;
    await addMember.mutateAsync({
      full_name: form.full_name.trim(),
      phone: form.phone || undefined,
      relation: form.relation,
      date_of_birth: form.date_of_birth || undefined,
      id_proof_type: form.id_proof_type || undefined,
      id_proof_number: form.id_proof_number || undefined,
    });
    setForm({ full_name: "", phone: "", relation: "spouse", date_of_birth: "", id_proof_type: "", id_proof_number: "" });
    setShowForm(false);
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm("Remove this member?")) return;
    await removeMember.mutateAsync(memberId);
  };

  return (
    <div className="ml-8 mr-3 mb-3 p-3 bg-card rounded-lg border border-border/60">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Flat Members ({members?.length ?? 0})
        </p>
        <Button size="xs" variant="secondary" onClick={() => setShowForm(!showForm)}>
          <UserPlus className="w-3 h-3 mr-1" /> Add Member
        </Button>
      </div>

      {/* Add Member Form */}
      {showForm && (
        <form onSubmit={handleAdd} className="mb-3 p-3 bg-muted-bg/50 rounded-md space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className={theme.label}>Name *</label>
              <input
                type="text" value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className={theme.input.base} placeholder="Full name" required
              />
            </div>
            <div>
              <label className={theme.label}>Phone</label>
              <input
                type="text" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={theme.input.base} placeholder="Phone number"
              />
            </div>
            <div>
              <label className={theme.label}>Relation *</label>
              <select
                value={form.relation}
                onChange={(e) => setForm({ ...form, relation: e.target.value })}
                className={theme.input.base}
              >
                {RELATION_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={theme.label}>Date of Birth</label>
              <input
                type="date" value={form.date_of_birth}
                onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                className={theme.input.base}
              />
            </div>
            <div>
              <label className={theme.label}>ID Proof Type</label>
              <select
                value={form.id_proof_type}
                onChange={(e) => setForm({ ...form, id_proof_type: e.target.value })}
                className={theme.input.base}
              >
                <option value="">None</option>
                <option value="aadhaar">Aadhaar</option>
                <option value="pan">PAN</option>
                <option value="driving_license">Driving License</option>
                <option value="passport">Passport</option>
              </select>
            </div>
            <div>
              <label className={theme.label}>ID Number</label>
              <input
                type="text" value={form.id_proof_number}
                onChange={(e) => setForm({ ...form, id_proof_number: e.target.value })}
                className={theme.input.base} placeholder="Optional"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button size="xs" variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button size="xs" type="submit" loading={addMember.isPending}>Add Member</Button>
          </div>
        </form>
      )}

      {/* Members List */}
      {isLoading ? (
        <p className="text-xs text-muted-foreground py-2">Loading...</p>
      ) : members?.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">No members added yet.</p>
      ) : (
        <div className="space-y-1">
          {members?.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between gap-3 px-2 py-1.5 rounded-md hover:bg-muted-bg/40 text-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-medium text-foreground truncate">{m.full_name}</span>
                <Badge variant="secondary" size="sm">{m.relation}</Badge>
                {m.phone && <span className="text-xs text-muted-foreground">{m.phone}</span>}
                {m.date_of_birth && (
                  <span className="text-xs text-muted-foreground hidden sm:inline">DOB: {m.date_of_birth}</span>
                )}
              </div>
              <Button
                size="xs" variant="ghost"
                onClick={() => handleRemove(m.id)}
                className="text-muted-foreground hover:text-destructive shrink-0"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
