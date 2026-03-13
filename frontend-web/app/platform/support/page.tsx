"use client";

import { useState } from "react";
import {
  usePlatformSupportList,
  usePlatformSupportStats,
  useCloseTicket,
  useUpdateSupportTicket,
} from "@/features/admin/hooks/usePlatformSupport";
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
  HelpCircle,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Building2,
} from "lucide-react";
import Link from "next/link";

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "waiting_on_customer", label: "Waiting on Customer" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export default function PlatformSupportPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data: stats } = usePlatformSupportStats();
  const { data, isLoading, error } = usePlatformSupportList({
    page,
    page_size: 20,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const closeMutation = useCloseTicket();
  const updateMutation = useUpdateSupportTicket();

  const handleClose = async (id: string) => {
    try {
      await closeMutation.mutateAsync(id);
    } catch (err) {
      console.error("Failed to close:", err);
    }
  };

  const handleStartProgress = async (id: string) => {
    try {
      await updateMutation.mutateAsync({ id, data: { status: "in_progress" } });
    } catch (err) {
      console.error("Failed to update:", err);
    }
  };

  if (error) {
    return (
      <div className="bg-error/10 text-error px-4 py-3 rounded-lg text-sm">
        Failed to load tickets: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support Tickets"
        description="Manage support requests from users and societies"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Tickets"
          value={stats?.total ?? 0}
          icon={HelpCircle}
        />
        <StatCard
          label="Open"
          value={stats?.open ?? 0}
          icon={Clock}
          color="warning"
        />
        <StatCard
          label="In Progress"
          value={stats?.in_progress ?? 0}
          icon={MessageSquare}
          color="info"
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
            placeholder="Search tickets..."
          />
        </div>
        <div className="w-48">
          <Select
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableTh>Ticket</TableTh>
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
              icon={<HelpCircle className="w-6 h-6" />}
              title="No tickets found"
              description="Try adjusting your search"
            />
          ) : (
            data?.items.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableTd>
                  <div className="max-w-xs">
                    <p className="font-medium text-foreground truncate">
                      {ticket.subject}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      #{ticket.ticket_number}
                    </p>
                  </div>
                </TableTd>
                <TableTd>
                  <div className="flex items-center gap-1.5 text-sm text-foreground">
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                    {ticket.society_name || "—"}
                  </div>
                </TableTd>
                <TableTd>
                  <span className="text-sm text-muted-foreground capitalize">
                    {ticket.category.replace(/_/g, " ")}
                  </span>
                </TableTd>
                <TableTd>
                  <PriorityBadge priority={ticket.priority} />
                </TableTd>
                <TableTd>
                  <StatusBadge status={ticket.status} />
                </TableTd>
                <TableTd>
                  <span className="text-sm text-muted-foreground">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                </TableTd>
                <TableTd>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/platform/support/${ticket.id}`}
                      className="p-1.5 rounded-lg hover:bg-muted-bg text-foreground transition"
                      title="View Details"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Link>
                    {ticket.status === "open" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleStartProgress(ticket.id)}
                        isLoading={updateMutation.isPending}
                        title="Start Working"
                        className="text-info hover:bg-info/10"
                      >
                        <Clock className="w-4 h-4" />
                      </Button>
                    )}
                    {ticket.status !== "closed" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleClose(ticket.id)}
                        isLoading={closeMutation.isPending}
                        title="Close Ticket"
                        className="text-error hover:bg-error/10"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
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
