"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader, Card, CardHeader, CardContent, Badge, Button, Avatar } from "@/components/ui";
import { useVisitById } from "@/features/visitors";
import { PageWrapper, StatusBadge, VisitTimeline } from "@/components/common";
import { theme } from "@/lib/theme";

export function VisitDetailsPageContent() {
  const params = useParams<{ id: string }>();
  const visitId = params?.id ? String(params.id) : null;
  const q = useVisitById(visitId, true);

  const v = q.data;

  return (
    <PageWrapper>
      <PageHeader
        title="Visit details"
        description={visitId ? `Visit ID: ${visitId}` : "—"}
        action={
          <Link href="/visitors">
            <Button size="sm" variant="secondary">Back to visitors</Button>
          </Link>
        }
      />

      {q.isLoading ? (
        <Card variant="outlined">
          <CardContent className="py-8">
            <div className={theme.text.muted}>Loading…</div>
          </CardContent>
        </Card>
      ) : !v ? (
        <Card variant="outlined">
          <CardContent className="py-8">
            <div className={theme.text.muted}>Visit not found or not accessible.</div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Status Timeline */}
          <Card variant="outlined" className="overflow-hidden">
            <CardContent className="py-6 flex justify-center">
              <VisitTimeline
                status={v.status}
                createdAt={v.created_at}
                actualArrival={v.actual_arrival}
                actualDeparture={v.actual_departure}
              />
            </CardContent>
          </Card>

          {/* Visitor Info */}
          <Card variant="outlined" className="overflow-hidden">
            <CardHeader className="border-b border-border py-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={v.visitor_name} size="lg" />
                <div>
                  <p className="font-semibold text-foreground">{v.visitor_name}</p>
                  <p className="text-sm text-muted-foreground">{v.visitor_phone}</p>
                </div>
              </div>
              <StatusBadge status={v.status} />
            </CardHeader>
            <CardContent className="py-4">
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${theme.text.body}`}>
                <div>
                  <p className="text-xs text-muted-foreground">Purpose</p>
                  <p className="font-medium text-foreground">{v.purpose || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Host</p>
                  <p className="font-medium text-foreground">{v.host_name || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Building</p>
                  <p className="font-medium text-foreground">{v.building_name || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Flat</p>
                  <p className="font-medium text-foreground">{v.host_flat_number || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-medium text-foreground">{v.is_walkin ? "Walk-in" : "Invited"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Consent</p>
                  <p className="font-medium text-foreground">{v.consent_given ? "Given" : "Not given"}</p>
                </div>
                {v.expected_arrival && (
                  <div>
                    <p className="text-xs text-muted-foreground">Expected arrival</p>
                    <p className="font-medium text-foreground">{new Date(v.expected_arrival).toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="font-medium text-foreground">{new Date(v.created_at).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PageWrapper>
  );
}

