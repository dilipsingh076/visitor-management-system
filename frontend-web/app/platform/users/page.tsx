"use client";

import { useState } from "react";
import {
  usePlatformUsersList,
  useBlockUser,
  useUnblockUser,
  useVerifyUser,
} from "@/features/admin/hooks/usePlatformUsers";
import {
  PageHeader,
  UserDrawer,
  Badge,
  Avatar,
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
  Users,
  Shield,
  Ban,
  CheckCircle,
  Building2,
  Filter,
} from "lucide-react";

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

interface UserData {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  flat_number: string | null;
  is_active: boolean;
  is_verified: boolean;
  role: string;
  roles: string[];
  society_id: string | null;
  building_id: string | null;
  last_login: string | null;
  created_at: string;
  society_name?: string | null;
}

export default function PlatformUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  const { data, isLoading, error } = usePlatformUsersList({
    page,
    page_size: 20,
    search: search || undefined,
    role: roleFilter || undefined,
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
        Failed to load users: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage all users across all societies"
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-sm">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search users..."
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

      {/* Table */}
      <Table>
        <TableHead>
          <TableTh>User</TableTh>
          <TableTh>Society</TableTh>
          <TableTh>Role</TableTh>
          <TableTh>Status</TableTh>
          <TableTh>Last Login</TableTh>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableLoading colSpan={5} />
          ) : data?.items.length === 0 ? (
            <TableEmpty
              colSpan={5}
              icon={<Users className="w-6 h-6" />}
              title="No users found"
              description="Try adjusting your search"
            />
          ) : (
            data?.items.map((user) => (
              <TableRow
                key={user.id}
                onClick={() => setSelectedUser(user as UserData)}
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
                  {user.society_name ? (
                    <div className="flex items-center gap-1.5 text-sm text-foreground">
                      <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="truncate max-w-[150px]">{user.society_name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
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

      {/* User Drawer */}
      {selectedUser && (
        <UserDrawer
          user={selectedUser}
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
