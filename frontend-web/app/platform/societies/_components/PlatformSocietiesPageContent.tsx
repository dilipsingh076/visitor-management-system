"use client";

import { canAccessPlatform } from "@/lib/auth";
import { useAuth } from "@/features/auth";
import { usePlatformSocietiesPage } from "@/features/platform";
import { Button } from "@/components/ui";
import { PageWrapper, PageLoadingSkeleton } from "@/components/common";
import { theme } from "@/lib/theme";
import { StatusBadge } from "@/components/common";

export function PlatformSocietiesPageContent() {
  const { user, loading } = useAuth({
    requireAuth: true,
    requireRole: canAccessPlatform,
    redirectTo: "/dashboard",
  });
  const enabled = !!user && canAccessPlatform(user);
  const {
    societies,
    isLoading,
    creating,
    setCreating,
    createName,
    setCreateName,
    createSlug,
    setCreateSlug,
    createEmail,
    setCreateEmail,
    createError,
    handleCreate,
    createMutation,
  } = usePlatformSocietiesPage(enabled);

  if (loading || !user) {
    return (
      <PageWrapper width="narrow">
        <PageLoadingSkeleton rows={4} showInput={false} />
      </PageWrapper>
    );
  }
  if (!canAccessPlatform(user)) return null;
  if (isLoading) {
    return (
      <PageWrapper width="narrow">
        <PageLoadingSkeleton rows={4} showInput={false} />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper width="narrow">
      <div className="flex items-center justify-between mb-4">
        <h1 className={theme.text.heading1}>Platform — Societies</h1>
        <Button variant="primary" size="sm" onClick={() => setCreating((v) => !v)}>
          {creating ? "Cancel" : "Add Society"}
        </Button>
      </div>
      {creating && (
        <form onSubmit={handleCreate} className={`mb-5 p-4 ${theme.surface.card} ${theme.space.formStack}`}>
          <h2 className={theme.sectionTitle}>Create society</h2>
          {createError && <p className={theme.auth.alertError}>{createError}</p>}
          <div>
            <label className={theme.label}>Name *</label>
            <input
              type="text"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="Green Valley Apartments"
              className={theme.input.base}
            />
          </div>
          <div>
            <label className={theme.label}>Slug (code) *</label>
            <input
              type="text"
              value={createSlug}
              onChange={(e) => setCreateSlug(e.target.value)}
              placeholder="green-valley"
              className={theme.input.base}
            />
          </div>
          <div>
            <label className={theme.label}>Contact email *</label>
            <input
              type="email"
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
              placeholder="admin@greenvalley.com"
              className={theme.input.base}
            />
          </div>
          <Button type="submit" variant="primary" size="sm" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create"}
          </Button>
        </form>
      )}
      <div className={theme.list.card}>
        <div className={theme.table.wrap}>
          <table className="w-full">
            <thead className={theme.table.thead}>
              <tr>
                <th className={theme.table.th}>Name</th>
                <th className={theme.table.th}>City</th>
                <th className={theme.table.th}>Slug</th>
                <th className={theme.table.th}>Plan</th>
                <th className={theme.table.th}>Status</th>
              </tr>
            </thead>
            <tbody className={theme.table.tbody}>
              {societies.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`${theme.table.td} text-center py-6 ${theme.text.mutedSmall}`}>
                    No societies yet. Create one to get started.
                  </td>
                </tr>
              ) : (
                societies.map((s) => (
                  <tr key={s.id} className={theme.list.rowHoverLight}>
                    <td className={`${theme.table.td} ${theme.text.body} font-medium text-foreground`}>{s.name}</td>
                    <td className={`${theme.table.td} ${theme.text.mutedSmall}`}>{s.city || "—"}</td>
                    <td className={`${theme.table.td} ${theme.text.mutedSmall} font-mono`}>{s.slug}</td>
                    <td className={`${theme.table.td} ${theme.text.mutedSmall}`}>{s.plan || "basic"}</td>
                    <td className={theme.table.td}>
                      <StatusBadge status={s.status === "active" ? "checked_in" : "default"} label={s.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  );
}
