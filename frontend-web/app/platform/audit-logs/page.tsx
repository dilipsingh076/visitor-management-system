"use client";

import { useState } from "react";
import { usePlatformAuditLogs } from "@/features/admin/hooks/usePlatformAuditLogs";
import {
  PageHeader,
  Badge,
  Avatar,
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
import { FileText, Clock } from "lucide-react";

type BadgeVariant = "default" | "primary" | "secondary" | "success" | "warning" | "error" | "info";

const METHOD_VARIANTS: Record<string, BadgeVariant> = {
  GET: "info",
  POST: "success",
  PATCH: "warning",
  PUT: "warning",
  DELETE: "error",
};

export default function PlatformAuditLogsPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");

  const { data, isLoading, error } = usePlatformAuditLogs({
    page,
    page_size: 50,
    action: actionFilter || undefined,
  });

  if (error) {
    return (
      <div className="bg-error/10 text-error px-4 py-3 rounded-lg text-sm">
        Failed to load audit logs: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Track all admin actions on the platform"
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-sm">
          <SearchInput
            value={actionFilter}
            onChange={setActionFilter}
            placeholder="Filter by action..."
          />
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableTh>User</TableTh>
          <TableTh>Action</TableTh>
          <TableTh>Method</TableTh>
          <TableTh>Endpoint</TableTh>
          <TableTh>Timestamp</TableTh>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableLoading colSpan={5} rows={10} />
          ) : data?.items.length === 0 ? (
            <TableEmpty
              colSpan={5}
              icon={<FileText className="w-6 h-6" />}
              title="No audit logs found"
              description="Actions will appear here when performed"
            />
          ) : (
            data?.items.map((log) => (
              <TableRow key={log.id}>
                <TableTd>
                  <div className="flex items-center gap-2">
                    <Avatar name={log.user_name} size="sm" />
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {log.user_name || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {log.user_email || "—"}
                      </p>
                    </div>
                  </div>
                </TableTd>
                <TableTd>
                  <span className="text-sm text-foreground font-mono">
                    {log.action}
                  </span>
                </TableTd>
                <TableTd>
                  <Badge variant={METHOD_VARIANTS[log.request_method || "GET"] || "secondary"}>
                    {log.request_method || "—"}
                  </Badge>
                </TableTd>
                <TableTd>
                  <span className="text-sm text-muted-foreground font-mono truncate block max-w-xs">
                    {log.endpoint}
                  </span>
                </TableTd>
                <TableTd>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(log.created_at).toLocaleString()}
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
          pageSize={50}
          total={data.total}
          totalPages={data.total_pages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
