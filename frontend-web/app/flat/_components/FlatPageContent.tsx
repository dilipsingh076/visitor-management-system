"use client";

import { useState } from "react";
import { PageWrapper } from "@/components/common";
import { PageHeader, Card, CardContent, Badge, Button } from "@/components/ui";
import { theme } from "@/lib/theme";
import { useAuthContext } from "@/features/auth";
import { useFlatMembers, useAddFlatMember, useRemoveFlatMember } from "@/features/admin";
import { useMyBills, useMySummary, useMyComplaints, useCreateComplaint } from "@/features/flat";
import {
  UserPlus, Trash2, Users, Home, Building2, CreditCard, AlertTriangle,
  IndianRupee, Clock, CheckCircle2, XCircle, Plus, MessageSquare,
} from "lucide-react";

const RELATION_OPTIONS = [
  { value: "spouse", label: "Spouse" },
  { value: "parent", label: "Parent" },
  { value: "child", label: "Child" },
  { value: "sibling", label: "Sibling" },
  { value: "other", label: "Other" },
];

const COMPLAINT_CATEGORIES = [
  { value: "maintenance", label: "Maintenance" },
  { value: "security", label: "Security" },
  { value: "noise", label: "Noise" },
  { value: "parking", label: "Parking" },
  { value: "amenities", label: "Amenities" },
  { value: "billing", label: "Billing" },
  { value: "visitor_issue", label: "Visitor Issue" },
  { value: "other", label: "Other" },
];

const TABS = [
  { key: "members", label: "Members", icon: Users },
  { key: "maintenance", label: "Dues", icon: CreditCard },
  { key: "complaints", label: "Complaints", icon: MessageSquare },
] as const;

type Tab = (typeof TABS)[number]["key"];

export function FlatPageContent() {
  const { user, loading } = useAuthContext();
  const flatId = user?.flat_id;
  const [activeTab, setActiveTab] = useState<Tab>("members");

  if (loading) {
    return (
      <PageWrapper>
        <PageHeader title="My Flat" description="Manage your flat and household" />
        <Card className="overflow-hidden rounded-lg">
          <div className="py-10 text-center text-sm text-muted-foreground">Loading…</div>
        </Card>
      </PageWrapper>
    );
  }

  if (!flatId) {
    return (
      <PageWrapper>
        <PageHeader title="My Flat" description="Manage your flat and household" />
        <Card className="overflow-hidden rounded-lg">
          <div className="py-10 text-center text-sm text-muted-foreground">
            <Home className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
            You are not assigned to a flat yet. Please contact your society admin.
          </div>
        </Card>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageHeader title="My Flat" description={`Flat ${user?.flat_number ?? ""}`} />

      {/* Flat Info Card */}
      <FlatInfoCard user={user} />

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border mb-4">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "members" && <MembersTab flatId={flatId} />}
      {activeTab === "maintenance" && <MaintenanceTab />}
      {activeTab === "complaints" && <ComplaintsTab />}
    </PageWrapper>
  );
}

/* ─────────────── Flat Info Card ─────────────── */

function FlatInfoCard({ user }: { user: { flat_number?: string; full_name?: string; email?: string; phone?: string } | null }) {
  if (!user) return null;
  return (
    <Card className="overflow-hidden rounded-lg mb-4">
      <CardContent className="py-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 flex-1 min-w-0">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Flat</p>
              <p className="text-sm font-semibold text-foreground">{user.flat_number ?? "—"}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Owner</p>
              <p className="text-sm font-medium text-foreground">{user.full_name ?? "—"}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Email</p>
              <p className="text-sm text-foreground truncate">{user.email ?? "—"}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Phone</p>
              <p className="text-sm text-foreground">{user.phone ?? "—"}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─────────────── Members Tab ─────────────── */

function MembersTab({ flatId }: { flatId: string }) {
  const { data: members, isLoading } = useFlatMembers(flatId);
  const addMember = useAddFlatMember(flatId);
  const removeMember = useRemoveFlatMember(flatId);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    full_name: "", phone: "", relation: "spouse",
    date_of_birth: "", id_proof_type: "", id_proof_number: "",
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
    <>
      <div className="flex justify-end mb-4">
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <UserPlus className="w-4 h-4 mr-2" />Add Member
        </Button>
      </div>

      {showForm && (
        <Card className="overflow-hidden rounded-lg mb-4">
          <CardContent className="py-4">
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className={theme.label}>Full Name *</label>
                  <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className={theme.input.base} placeholder="Full name" required />
                </div>
                <div>
                  <label className={theme.label}>Phone</label>
                  <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={theme.input.base} placeholder="Phone number" />
                </div>
                <div>
                  <label className={theme.label}>Relation *</label>
                  <select value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })} className={theme.input.base}>
                    {RELATION_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={theme.label}>Date of Birth</label>
                  <input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                    className={theme.input.base} />
                </div>
                <div>
                  <label className={theme.label}>ID Proof Type</label>
                  <select value={form.id_proof_type} onChange={(e) => setForm({ ...form, id_proof_type: e.target.value })} className={theme.input.base}>
                    <option value="">None</option>
                    <option value="aadhaar">Aadhaar</option>
                    <option value="pan">PAN</option>
                    <option value="driving_license">Driving License</option>
                    <option value="passport">Passport</option>
                  </select>
                </div>
                <div>
                  <label className={theme.label}>ID Number</label>
                  <input type="text" value={form.id_proof_number} onChange={(e) => setForm({ ...form, id_proof_number: e.target.value })}
                    className={theme.input.base} placeholder="Optional" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" size="sm" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button size="sm" type="submit" loading={addMember.isPending}>Add Member</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <Card className="overflow-hidden rounded-lg">
          <div className="py-10 text-center text-sm text-muted-foreground">Loading members...</div>
        </Card>
      ) : members?.length === 0 ? (
        <Card className="overflow-hidden rounded-lg">
          <div className="py-10 text-center text-sm text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
            No family members added yet. Click &quot;Add Member&quot; to add your family members.
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {members?.map((m) => (
            <Card key={m.id} className="overflow-hidden rounded-lg">
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-foreground">{m.full_name}</h3>
                      <Badge variant="default" size="sm">{m.relation}</Badge>
                    </div>
                    <div className="space-y-0.5 text-xs text-muted-foreground">
                      {m.phone && <p>Phone: {m.phone}</p>}
                      {m.date_of_birth && <p>DOB: {m.date_of_birth}</p>}
                      {m.id_proof_type && <p>{m.id_proof_type.toUpperCase()}: {m.id_proof_number || "—"}</p>}
                    </div>
                  </div>
                  <Button size="xs" variant="ghost" onClick={() => handleRemove(m.id)}
                    className="text-muted-foreground hover:text-destructive shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

/* ─────────────── Maintenance Tab ─────────────── */

function MaintenanceTab() {
  const { data: summary } = useMySummary();
  const { data: bills, isLoading } = useMyBills();

  const statusIcon = (s: string) => {
    if (s === "paid") return <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />;
    if (s === "overdue") return <XCircle className="w-3.5 h-3.5 text-red-500" />;
    return <Clock className="w-3.5 h-3.5 text-yellow-500" />;
  };

  const statusBadge = (s: string) => {
    const variant = s === "paid" ? "success" as const : s === "overdue" ? "error" as const : "warning" as const;
    return <Badge variant={variant} size="sm">{s}</Badge>;
  };

  return (
    <>
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <Card className="overflow-hidden rounded-lg">
            <CardContent className="py-3 text-center">
              <IndianRupee className="w-5 h-5 mx-auto mb-1 text-red-500" />
              <p className="text-lg font-bold text-foreground">{summary.total_due.toLocaleString("en-IN")}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Total Due</p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden rounded-lg">
            <CardContent className="py-3 text-center">
              <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-green-500" />
              <p className="text-lg font-bold text-foreground">{summary.total_paid.toLocaleString("en-IN")}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Total Paid</p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden rounded-lg">
            <CardContent className="py-3 text-center">
              <Clock className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
              <p className="text-lg font-bold text-foreground">{summary.pending_count}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Pending</p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden rounded-lg">
            <CardContent className="py-3 text-center">
              <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-red-500" />
              <p className="text-lg font-bold text-foreground">{summary.overdue_count}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Overdue</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bills List */}
      {isLoading ? (
        <Card className="overflow-hidden rounded-lg">
          <div className="py-10 text-center text-sm text-muted-foreground">Loading bills...</div>
        </Card>
      ) : !bills || bills.length === 0 ? (
        <Card className="overflow-hidden rounded-lg">
          <div className="py-10 text-center text-sm text-muted-foreground">
            <CreditCard className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
            No maintenance bills yet.
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Period</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Due Date</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Paid On</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((b) => (
                  <tr key={b.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-foreground">{b.period}</div>
                      {b.description && <p className="text-xs text-muted-foreground">{b.description}</p>}
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold text-foreground">
                      {Number(b.amount).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{b.due_date}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        {statusIcon(b.status)}
                        {statusBadge(b.status)}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {b.paid_date ?? "—"}
                      {b.payment_method && <span className="text-xs ml-1">({b.payment_method})</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}

/* ─────────────── Complaints Tab ─────────────── */

function ComplaintsTab() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const { data: complaints, isLoading } = useMyComplaints(statusFilter);
  const createComplaint = useCreateComplaint();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", category: "maintenance", priority: "medium",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;
    await createComplaint.mutateAsync({
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      priority: form.priority,
    });
    setForm({ title: "", description: "", category: "maintenance", priority: "medium" });
    setShowForm(false);
  };

  const statusBadge = (s: string) => {
    const v = s === "resolved" || s === "closed" ? "success" as const
      : s === "in_progress" ? "warning" as const
      : s === "escalated" ? "error" as const
      : "default" as const;
    return <Badge variant={v} size="sm">{s.replace("_", " ")}</Badge>;
  };

  const priorityBadge = (p: string) => {
    const v = p === "urgent" || p === "high" ? "error" as const
      : p === "medium" ? "warning" as const
      : "default" as const;
    return <Badge variant={v} size="sm">{p}</Badge>;
  };

  return (
    <>
      {/* Top bar */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex gap-1.5">
          {[undefined, "open", "in_progress", "resolved"].map((s) => (
            <button
              key={s ?? "all"}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {s ? s.replace("_", " ") : "All"}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1" />New Complaint
        </Button>
      </div>

      {/* New Complaint Form */}
      {showForm && (
        <Card className="overflow-hidden rounded-lg mb-4">
          <CardContent className="py-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={theme.label}>Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={theme.input.base} placeholder="Brief title for your complaint" required />
              </div>
              <div>
                <label className={theme.label}>Description *</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={`${theme.input.base} min-h-[80px]`} placeholder="Describe the issue in detail..." required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={theme.label}>Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={theme.input.base}>
                    {COMPLAINT_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={theme.label}>Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className={theme.input.base}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" size="sm" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button size="sm" type="submit" loading={createComplaint.isPending}>Submit Complaint</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Complaints List */}
      {isLoading ? (
        <Card className="overflow-hidden rounded-lg">
          <div className="py-10 text-center text-sm text-muted-foreground">Loading complaints...</div>
        </Card>
      ) : !complaints || complaints.length === 0 ? (
        <Card className="overflow-hidden rounded-lg">
          <div className="py-10 text-center text-sm text-muted-foreground">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
            {statusFilter ? `No ${statusFilter.replace("_", " ")} complaints.` : "No complaints filed yet."}
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => (
            <Card key={c.id} className="overflow-hidden rounded-lg">
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-foreground">{c.title}</h3>
                  <div className="flex gap-1.5 shrink-0">
                    {priorityBadge(c.priority)}
                    {statusBadge(c.status)}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{c.description}</p>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="capitalize">{c.category.replace("_", " ")}</span>
                  <span>Filed: {new Date(c.created_at).toLocaleDateString()}</span>
                  {c.resolved_at && <span>Resolved: {new Date(c.resolved_at).toLocaleDateString()}</span>}
                </div>
                {c.resolution_notes && (
                  <div className="mt-2 p-2 rounded bg-muted/30 text-xs text-muted-foreground">
                    <span className="font-medium">Resolution:</span> {c.resolution_notes}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
