"use client";

import { useState } from "react";
import {
  usePlatformComplaintsList,
  usePlatformComplaintStats,
  useEscalateComplaint,
  useUpdateComplaint,
} from "@/features/admin/hooks/usePlatformComplaints";
import {
  PageHeader,
  StatCard,
  StatusBadge,
  PriorityBadge,
  Button,
  Select,
  Table,
  TableHead,
  TableTh,
  TableBody,
  TableRow,
  TableTd,
  TableEmpty,
  TableLoading,
  Pagination,
} from "../components";
import { SearchInput } from "@/components/common/SearchInput";
import {
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Building2,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "escalated", label: "Escalated" },
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

export default function PlatformComplaintsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const { data: stats } = usePlatformComplaintStats();
  const { data, isLoading, error } = usePlatformComplaintsList({
    page,
    page_size: 20,
    search: search || undefined,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
  });

  const escalateMutation = useEscalateComplaint();
  const updateMutation = useUpdateComplaint();

  const handleEscalate = async (id: string) => {
    const reason = prompt("Enter escalation reason:");
    if (!reason) return;
    try {
      await escalateMutation.mutateAsync({ id, reason });
    } catch (err) {
      console.error("Failed to escalate:", err);
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
      <div className="bg-error/10 text-error px-4 py-3 rounded-lg text-sm">
        Failed to load complaints: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Complaints"
        description="Monitor and manage complaints from all societies"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total"
          value={stats?.total ?? 0}
          icon={MessageSquare}
        />
        <StatCard
          label="Open"
          value={stats?.open ?? 0}
          icon={Clock}
          color="warning"
        />
        <StatCard
          label="Escalated"
          value={stats?.escalated ?? 0}
          icon={AlertTriangle}
          color="error"
        />
        <StatCard
          label="Resolved"
          value={stats?.resolved ?? 0}
          icon={CheckCircle}
          color="success"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-sm">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search complaints..."
          />
        </div>
        <div className="w-40">
          <Select
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
        <div className="w-40">
          <Select
            options={PRIORITY_OPTIONS}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableTh>Complaint</TableTh>
          <TableTh>Society</TableTh>
          <TableTh>Category</TableTh>
          <TableTh>Priority</TableTh>
          <TableTh>Status</TableTh>
          <TableTh>Created</TableTh>
          <TableTh>Actions</TableTh>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableLoading colSpan={7} />
          ) : data?.items.length === 0 ? (
            <TableEmpty
              colSpan={7}
              icon={<MessageSquare className="w-6 h-6" />}
              title="No complaints found"
              description="Try adjusting your filters"
            />
          ) : (
            data?.items.map((complaint) => (
              <TableRow key={complaint.id}>
                <TableTd>
                  <div className="max-w-xs">
                    <p className="font-medium text-foreground truncate">
                      {complaint.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      By: {complaint.filed_by_name || "Unknown"}
                    </p>
                  </div>
                </TableTd>
                <TableTd>
                  <div className="flex items-center gap-1.5 text-sm text-foreground">
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                    {complaint.society_name || "—"}
                  </div>
                </TableTd>
                <TableTd>
                  <span className="text-sm text-muted-foreground capitalize">
                    {complaint.category.replace(/_/g, " ")}
                  </span>
                </TableTd>
                <TableTd>
                  <PriorityBadge priority={complaint.priority} />
                </TableTd>
                <TableTd>
                  <StatusBadge status={complaint.status} />
                </TableTd>
                <TableTd>
                  <span className="text-sm text-muted-foreground">
                    {new Date(complaint.created_at).toLocaleDateString()}
                  </span>
                </TableTd>
                <TableTd>
                  <div className="flex items-center gap-1">
                    {complaint.status !== "resolved" &&
                      complaint.status !== "closed" && (
                        <>
                          {!complaint.escalated && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEscalate(complaint.id)}
                              isLoading={escalateMutation.isPending}
                              title="Escalate"
                              className="text-error hover:bg-error/10"
                            >
                              <ArrowUpRight className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleResolve(complaint.id)}
                            isLoading={updateMutation.isPending}
                            title="Mark Resolved"
                            className="text-success hover:bg-success/10"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                  </div>
                </TableTd>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {data && data.total_pages > 1 && (
        <Pagination
          page={data.page}
          pageSize={20}
          total={data.total}
          totalPages={data.total_pages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
