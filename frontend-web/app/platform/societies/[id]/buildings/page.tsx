"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { listBuildings } from "@/lib/api";
import {
  PageHeader,
  Table,
  TableHead,
  TableTh,
  TableBody,
  TableRow,
  TableTd,
  TableEmpty,
  TableLoading,
} from "../../../components";
import { Building2 } from "lucide-react";
import Link from "next/link";
import { usePlatformSocietyDetail } from "@/features/admin/hooks/usePlatformSocieties";

export default function SocietyBuildingsPage() {
  const params = useParams();
  const societyId = params.id as string;

  const { data: society, isLoading: societyLoading } = usePlatformSocietyDetail(societyId);
  const { data: buildings = [], isLoading: buildingsLoading } = useQuery({
    queryKey: ["buildings", societyId],
    queryFn: () => listBuildings(societyId),
    enabled: !!societyId,
  });

  const isLoading = societyLoading || buildingsLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Buildings"
        description={society ? `Buildings in ${society.name}` : "Buildings in this society"}
        breadcrumbs={[
          { label: "Societies", href: "/platform/societies" },
          { label: society?.name ?? "Society", href: `/platform/societies/${societyId}` },
          { label: "Buildings" },
        ]}
      />

      <Table>
        <TableHead>
          <TableTh>Name</TableTh>
          <TableTh>Code</TableTh>
          <TableTh>Sort order</TableTh>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableLoading colSpan={3} />
          ) : buildings.length === 0 ? (
            <TableEmpty
              colSpan={3}
              icon={<Building2 className="w-6 h-6" />}
              title="No buildings"
              description="This society has no buildings yet"
            />
          ) : (
            buildings.map((b) => (
              <TableRow key={b.id}>
                <TableTd>
                  <span className="font-medium text-foreground">{b.name}</span>
                </TableTd>
                <TableTd>
                  <span className="text-sm text-muted-foreground font-mono">{b.code ?? "—"}</span>
                </TableTd>
                <TableTd>
                  <span className="text-sm text-muted-foreground">{b.sort_order ?? "—"}</span>
                </TableTd>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
