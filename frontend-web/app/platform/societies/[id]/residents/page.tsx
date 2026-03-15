"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  usePlatformUsersList,
  useBlockUser,
  useUnblockUser,
  useVerifyUser,
} from "@/features/admin/hooks/usePlatformUsers";
import { usePlatformSocietyDetail } from "@/features/admin/hooks/usePlatformSocieties";
import type { PlatformUser } from "@/features/admin/types";
import {
  PageHeader,
  UserDrawer,
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
  Select,
} from "../../../components";
import { SearchInput } from "@/components/common/SearchInput";
import { Users, Shield, Filter } from "lucide-react";

type BadgeVariant = "default" | "primary" | "secondary" | "success" | "warning" | "error" | "info";

const ROLE_VARIANTS: Record<string, BadgeVariant> = {
  platform_admin: "primary",
  chairman: "info",
  secretary: "secondary",
  treasurer: "warning",
  guard: "default",
  resident: "success",
};

const ROLE_OPTIONS = [
  { value: "", label: "All Roles" },
  { value: "platform_admin", label: "Platform Admin" },
  { value: "chairman", label: "Chairman" },
  { value: "secretary", label: "Secretary" },
  { value: "treasurer", label: "Treasurer" },
  { value: "guard", label: "Guard" },
  { value: "resident", label: "Resident" },
];

export default function SocietyResidentsPage() {
  const params = useParams();
  const societyId = params.id as string;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);

  const { data: society } = usePlatformSocietyDetail(societyId);
  const { data, isLoading, error } = usePlatformUsersList({
    page,
    page_size: 20,
    search: search || undefined,
    role: roleFilter || undefined,
    society_id: societyId,
  });

  const blockMutation = useBlockUser();
  const unblockMutation = useUnblockUser();
  const verifyMutation = useVerifyUser();

  const handleBlock = async (id: string) => {
    try {
      await blockMutation.mutateAsync(id);
      setSelectedUser(null);
    } catch (err) {
      console.error("Failed to block:", err);
    }
  };

  const handleUnblock = async (id: string) => {
    try {
      await unblockMutation.mutateAsync(id);
      setSelectedUser(null);
    } catch (err) {
      console.error("Failed to unblock:", err);
    }
  };

  const handleVerify = async (id: string) => {
    try {
      await verifyMutation.mutateAsync(id);
      setSelectedUser(null);
    } catch (err) {
      console.error("Failed to verify:", err);
    }
  };

  if (error) {
    return (
      <div className="bg-error/10 text-error px-4 py-3 rounded-lg text-sm">
        Failed to load residents: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Residents"
        description={society ? `All residents and users in ${society.name}` : "Residents in this society"}
        breadcrumbs={[
          { label: "Societies", href: "/platform/societies" },
          { label: society?.name ?? "Society", href: `/platform/societies/${societyId}` },
          { label: "Residents" },
        ]}
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-sm">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search residents..."
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="w-44">
            <Select
              options={ROLE_OPTIONS}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Table ariaLabel="Residents" stickyHeader>
        <TableHead>
          <TableTh>User</TableTh>
          <TableTh>Role</TableTh>
          <TableTh>Status</TableTh>
          <TableTh>Last Login</TableTh>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableLoading colSpan={4} />
          ) : data?.items.length === 0 ? (
            <TableEmpty
              colSpan={4}
              icon={<Users className="w-6 h-6" />}
              title="No residents found"
              description="Try adjusting your search or filters"
            />
          ) : (
            data?.items.map((user) => (
              <TableRow
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className="cursor-pointer"
              >
                <TableTd>
                  <div className="flex items-center gap-3">
                    <Avatar name={user.full_name} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {user.full_name || "No Name"}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </TableTd>
                <TableTd>
                  <Badge variant={ROLE_VARIANTS[user.role] || "default"}>
                    {user.role.replace(/_/g, " ")}
                  </Badge>
                </TableTd>
                <TableTd>
                  <div className="flex items-center gap-2">
                    <Badge variant={user.is_active ? "success" : "error"}>
                      {user.is_active ? "Active" : "Blocked"}
                    </Badge>
                    {user.is_verified && (
                      <Shield className="w-3.5 h-3.5 text-primary" />
                    )}
                  </div>
                </TableTd>
                <TableTd>
                  <span className="text-sm text-muted-foreground">
                    {user.last_login
                      ? new Date(user.last_login).toLocaleDateString()
                      : "Never"}
                  </span>
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

      {selectedUser && (
        <UserDrawer
          user={{ ...selectedUser, full_name: selectedUser.full_name ?? null, roles: selectedUser.roles ?? [] }}
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          onBlock={handleBlock}
          onUnblock={handleUnblock}
          onVerify={handleVerify}
        />
      )}
    </div>
  );
}
