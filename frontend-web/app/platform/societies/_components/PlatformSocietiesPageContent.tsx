"use client";

import { useState } from "react";
import { canAccessPlatform } from "@/lib/auth";
import { useAuth } from "@/features/auth";
import { useSocieties, useCreateSociety } from "@/features/platform";
import { Button } from "@/components/ui";

function slugFromName(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "society";
}

export function PlatformSocietiesPageContent() {
  const { user, loading } = useAuth({
    requireAuth: true,
    requireRole: canAccessPlatform,
    redirectTo: "/dashboard",
  });
  const { data: societies = [], isLoading } = useSocieties(!!user && canAccessPlatform(user));
  const createMutation = useCreateSociety();
  const [creating, setCreating] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createSlug, setCreateSlug] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createError, setCreateError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    if (!createName.trim() || !createSlug.trim() || !createEmail.trim()) {
      setCreateError("Name, slug, and contact email are required.");
      return;
    }
    const slug = createSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "society";
    try {
      const created = await createMutation.mutateAsync({
        name: createName.trim(),
        slug,
        contact_email: createEmail.trim(),
      });
      if (created) {
        setCreateName("");
        setCreateSlug("");
        setCreateEmail("");
        setCreating(false);
      } else {
        setCreateError("Failed to create society. Slug may already exist.");
      }
    } catch {
      setCreateError("Failed to create society. Slug may already exist.");
    }
  };

  if (loading || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="h-8 w-48 bg-muted-bg rounded animate-pulse" />
        <div className="mt-6 h-64 bg-muted-bg rounded animate-pulse" />
      </div>
    );
  }
  if (!canAccessPlatform(user)) return null;
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="h-8 w-48 bg-muted-bg rounded animate-pulse" />
        <div className="mt-6 h-64 bg-muted-bg rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Platform — Societies</h1>
        <Button variant="primary" size="md" onClick={() => setCreating((v) => !v)}>
          {creating ? "Cancel" : "Add Society"}
        </Button>
      </div>
      {creating && (
        <form onSubmit={handleCreate} className="mb-8 p-6 bg-card border border-border rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Create society</h2>
          {createError && <p className="text-sm text-error bg-error-light px-3 py-2 rounded-lg">{createError}</p>}
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Name *</label>
            <input type="text" value={createName} onChange={(e) => { setCreateName(e.target.value); if (!createSlug) setCreateSlug(slugFromName(e.target.value)); }} placeholder="Green Valley Apartments" className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Slug (code) *</label>
            <input type="text" value={createSlug} onChange={(e) => setCreateSlug(e.target.value)} placeholder="green-valley" className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Contact email *</label>
            <input type="email" value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} placeholder="admin@greenvalley.com" className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary" />
          </div>
          <Button type="submit" variant="primary" size="md" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create"}
          </Button>
        </form>
      )}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted-bg border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted">Name</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted">Slug</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted">Contact</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted">Status</th>
            </tr>
          </thead>
          <tbody>
            {societies.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted">No societies yet. Create one to get started.</td></tr>
            ) : (
              societies.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-foreground font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-muted font-mono text-sm">{s.slug}</td>
                  <td className="px-4 py-3 text-muted text-sm">{s.contact_email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded ${s.status === "active" ? "bg-green-100 text-green-800" : "bg-muted-bg text-muted"}`}>{s.status}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
