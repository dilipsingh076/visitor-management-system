"use client";

import { useState } from "react";
import {
  useSocietyComplaintsList,
  useSocietyComplaintStats,
  useCreateSocietyComplaint,
  useUpdateSocietyComplaint,
} from "@/features/complaints";
import { Avatar, Badge, Button, Card, CardContent, CardHeader, StatCard, StatCardSkeleton } from "@/components/ui";
import { SearchInput } from "@/components/common/SearchInput";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { theme } from "@/lib/theme";
import {
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  X,
  Filter,
  ArrowUp,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const PRIORITY_OPTIONS = [
  { value: "", label: "All Priority" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const CATEGORY_OPTIONS = [
  { value: "maintenance", label: "Maintenance" },
  { value: "security", label: "Security" },
  { value: "noise", label: "Noise" },
  { value: "parking", label: "Parking" },
  { value: "cleanliness", label: "Cleanliness" },
  { value: "billing", label: "Billing" },
  { value: "amenities", label: "Amenities" },
  { value: "other", label: "Other" },
];

const getStatusBadge = (status: string) => {
  const variants: Record<string, { variant: "success" | "warning" | "info" | "default" | "error"; label: string }> = {
    open: { variant: "warning", label: "Open" },
    in_progress: { variant: "info", label: "In Progress" },
    resolved: { variant: "success", label: "Resolved" },
    closed: { variant: "default", label: "Closed" },
    escalated: { variant: "error", label: "Escalated" },
  };
  const config = variants[status] || { variant: "default" as const, label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const getPriorityBadge = (priority: string) => {
  const variants: Record<string, { variant: "success" | "warning" | "info" | "default" | "error"; label: string }> = {
    low: { variant: "default", label: "Low" },
    medium: { variant: "info", label: "Medium" },
    high: { variant: "warning", label: "High" },
    urgent: { variant: "error", label: "Urgent" },
  };
  const config = variants[priority] || { variant: "default" as const, label: priority };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export function ComplaintsPageContent() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newComplaint, setNewComplaint] = useState({
    title: "",
    description: "",
    category: "maintenance",
    priority: "medium",
  });

  const { data: stats } = useSocietyComplaintStats();
  const { data, isLoading, error } = useSocietyComplaintsList({
    page,
    page_size: 20,
    search: search || undefined,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
  });

  const createMutation = useCreateSocietyComplaint();
  const updateMutation = useUpdateSocietyComplaint();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComplaint.title.trim() || !newComplaint.description.trim()) return;

    try {
      await createMutation.mutateAsync(newComplaint);
      setNewComplaint({ title: "", description: "", category: "maintenance", priority: "medium" });
      setShowCreateForm(false);
    } catch (err) {
      console.error("Failed to create complaint:", err);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await updateMutation.mutateAsync({ id, data: { status: "resolved" } });
    } catch (err) {
      console.error("Failed to resolve:", err);
    }
  };

  if (error) {
    return (
      <PageWrapper width="wide">
        <div className="bg-error/10 text-error px-4 py-3 rounded-lg text-sm">
          Failed to load complaints: {error.message}
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper width="wide">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className={theme.text.heading2}>Society Complaints</h1>
            <p className={theme.text.subtitle}>Manage and track complaints in your society</p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Complaint
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard label="Total" value={stats?.total ?? 0} icon={() => <MessageSquare className="w-4 h-4" />} />
              <StatCard label="Open" value={stats?.open ?? 0} variant="warning" icon={() => <Clock className="w-4 h-4" />} />
              <StatCard label="Escalated" value={stats?.escalated ?? 0} variant="error" icon={() => <AlertTriangle className="w-4 h-4" />} />
              <StatCard label="Resolved" value={stats?.resolved ?? 0} variant="success" icon={() => <CheckCircle className="w-4 h-4" />} />
            </>
          )}
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <Card variant="outlined">
            <CardHeader className={`${theme.surface.cardHeader} py-3`}>
              <span className={theme.sectionTitle}>New Complaint</span>
            </CardHeader>
            <CardContent className="py-4">
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className={theme.label}>Title *</label>
                  <input
                    type="text"
                    value={newComplaint.title}
                    onChange={(e) => setNewComplaint({ ...newComplaint, title: e.target.value })}
                    className={theme.input.base}
                    placeholder="Brief description of the issue"
                    required
                  />
                </div>
                <div>
                  <label className={theme.label}>Description *</label>
                  <textarea
                    value={newComplaint.description}
                    onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                    className={`${theme.input.base} min-h-[100px]`}
                    placeholder="Detailed description of the complaint..."
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={theme.label}>Category</label>
                    <select
                      value={newComplaint.category}
                      onChange={(e) => setNewComplaint({ ...newComplaint, category: e.target.value })}
                      className={theme.select.base}
                    >
                      {CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={theme.label}>Priority</label>
                    <select
                      value={newComplaint.priority}
                      onChange={(e) => setNewComplaint({ ...newComplaint, priority: e.target.value })}
                      className={theme.select.base}
                    >
                      {PRIORITY_OPTIONS.filter((o) => o.value).map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="secondary" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={createMutation.isPending}>
                    Submit Complaint
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 max-w-sm">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search complaints..."
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Complaints List */}
        <div className="space-y-3">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-4">
                <div className={theme.loading.page}>
                  <div className={theme.loading.line} />
                  <div className={theme.loading.block} />
                </div>
              </div>
            ))
          ) : data?.items.length === 0 ? (
            <Card variant="outlined" className="text-center py-12">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No complaints found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {search || statusFilter || priorityFilter
                  ? "Try adjusting your filters"
                  : "Create a new complaint to get started"}
              </p>
            </Card>
          ) : (
            data?.items.map((complaint) => (
              <Card key={complaint.id} variant="outlined" className="hover:border-primary/20 transition">
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{complaint.title}</h3>
                          <p className={`${theme.text.mutedSmall} truncate mt-0.5`}>
                            {complaint.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {getStatusBadge(complaint.status)}
                          {getPriorityBadge(complaint.priority)}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 flex-wrap">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Avatar name={complaint.filed_by_name || "Unknown"} size="xs" />
                          <span>{complaint.filed_by_name || "Unknown"}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(complaint.created_at).toLocaleDateString()}
                        </span>
                        <Badge variant="default" className="capitalize">
                          {complaint.category.replace(/_/g, " ")}
                        </Badge>
                        {complaint.escalated && (
                          <Badge variant="error">
                            <ArrowUp className="w-3 h-3 mr-1" />
                            Escalated
                          </Badge>
                        )}
                      </div>
                      {complaint.status !== "resolved" && complaint.status !== "closed" && (
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="xs"
                            variant="secondary"
                            onClick={() => handleResolve(complaint.id)}
                            loading={updateMutation.isPending}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Mark Resolved
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {data && data.total_pages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {data.page} of {data.total_pages} ({data.total} total)
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                disabled={page === data.total_pages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
