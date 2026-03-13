"use client";

import { useState } from "react";
import { usePlatformSocietiesList, useActivateSociety, useDeactivateSociety } from "@/features/admin/hooks/usePlatformSocieties";
import {
  PageHeader,
  Button,
  Badge,
  Table,
  TableHead,
  TableTh,
  TableBody,
  TableRow,
  TableTd,
  TableEmpty,
  TableLoading,
  Pagination,
  Dropdown,
} from "../components";
import { SearchInput } from "@/components/common/SearchInput";
import {
  Building2,
  Users,
  MapPin,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Eye,
  Plus,
} from "lucide-react";
import Link from "next/link";

export default function PlatformSocietiesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const { data, isLoading, error } = usePlatformSocietiesList({
    page,
    page_size: 20,
    search: search || undefined,
  });

  const activateMutation = useActivateSociety();
  const deactivateMutation = useDeactivateSociety();

  const handleActivate = async (id: string) => {
    try {
      await activateMutation.mutateAsync(id);
      setActiveMenu(null);
    } catch (err) {
      console.error("Failed to activate:", err);
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await deactivateMutation.mutateAsync(id);
      setActiveMenu(null);
    } catch (err) {
      console.error("Failed to deactivate:", err);
    }
  };

  if (error) {
    return (
      <div className="bg-error/10 text-error px-4 py-3 rounded-lg text-sm">
        Failed to load societies: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Societies"
        description="Manage all societies on the platform"
        actions={
          <Link href="/platform/societies/new">
            <Button leftIcon={<Plus className="w-4 h-4" />}>
              Add Society
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-sm">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search societies..."
          />
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableTh>Society</TableTh>
          <TableTh>Location</TableTh>
          <TableTh>Plan</TableTh>
          <TableTh>Buildings</TableTh>
          <TableTh>Residents</TableTh>
          <TableTh>Status</TableTh>
          <TableTh>Actions</TableTh>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableLoading colSpan={7} />
          ) : data?.items.length === 0 ? (
            <TableEmpty
              colSpan={7}
              icon={<Building2 className="w-6 h-6" />}
              title="No societies found"
              description="Try adjusting your search"
            />
          ) : (
            data?.items.map((society) => (
              <TableRow key={society.id}>
                <TableTd>
                  <div>
                    <p className="font-medium text-foreground">{society.name}</p>
                    <p className="text-xs text-muted-foreground">{society.slug}</p>
                  </div>
                </TableTd>
                <TableTd>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    {society.city || "—"}
                  </div>
                </TableTd>
                <TableTd>
                  <Badge variant="primary">{society.plan || "basic"}</Badge>
                </TableTd>
                <TableTd>
                  <span className="text-sm text-foreground">{society.total_buildings}</span>
                </TableTd>
                <TableTd>
                  <div className="flex items-center gap-1.5 text-sm text-foreground">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                    {society.total_residents}
                  </div>
                </TableTd>
                <TableTd>
                  <Badge 
                    variant={society.is_active ? "success" : "error"} 
                    dot
                  >
                    {society.is_active ? (society.status || "Active") : "Inactive"}
                  </Badge>
                </TableTd>
                <TableTd>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setActiveMenu(activeMenu === society.id ? null : society.id)}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                    
                    {activeMenu === society.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setActiveMenu(null)}
                        />
                        <div className="absolute right-0 mt-1 w-40 bg-card rounded-lg shadow-lg border border-border z-20 py-1">
                          <Link
                            href={`/platform/societies/${society.id}`}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted-bg transition"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </Link>
                          {society.is_active ? (
                            <button
                              onClick={() => handleDeactivate(society.id)}
                              disabled={deactivateMutation.isPending}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-muted-bg transition"
                            >
                              <XCircle className="w-4 h-4" />
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivate(society.id)}
                              disabled={activateMutation.isPending}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-success hover:bg-muted-bg transition"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Activate
                            </button>
                          )}
                        </div>
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
