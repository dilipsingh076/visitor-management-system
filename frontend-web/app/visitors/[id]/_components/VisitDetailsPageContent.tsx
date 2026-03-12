"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader, Card, CardHeader, CardContent, Badge, Button } from "@/components/ui";
import { useVisitById } from "@/features/visitors";
import { PageWrapper } from "@/components/common";
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

      <Card variant="outlined" className="overflow-hidden">
        <CardHeader className="border-b border-border py-3 flex flex-row items-center justify-between">
          <span className="text-sm font-semibold text-foreground">Visitor</span>
          {v?.status && <Badge variant="primary" size="sm">{v.status.replace("_", " ")}</Badge>}
        </CardHeader>
        <CardContent className="py-4">
          {q.isLoading ? (
            <div className={theme.text.muted}>Loading…</div>
          ) : !v ? (
            <div className={theme.text.muted}>Visit not found or not accessible.</div>
          ) : (
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${theme.text.body}`}>
              <div>
                <p className={theme.text.mutedSmall}>Name</p>
                <p className={`font-medium text-foreground ${theme.text.body}`}>{v.visitor_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium text-foreground">{v.visitor_phone}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Purpose</p>
                <p className="font-medium text-foreground">{v.purpose || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Host</p>
                <p className="font-medium text-foreground">{v.host_name || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="font-medium text-foreground">{new Date(v.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Walk-in</p>
                <p className="font-medium text-foreground">{v.is_walkin ? "Yes" : "No"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Expected arrival</p>
                <p className="font-medium text-foreground">{v.expected_arrival ? new Date(v.expected_arrival).toLocaleString() : "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Actual arrival</p>
                <p className="font-medium text-foreground">{v.actual_arrival ? new Date(v.actual_arrival).toLocaleString() : "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Check-out</p>
                <p className="font-medium text-foreground">{v.actual_departure ? new Date(v.actual_departure).toLocaleString() : "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Consent</p>
                <p className="font-medium text-foreground">{v.consent_given ? "Given" : "Not given"}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

