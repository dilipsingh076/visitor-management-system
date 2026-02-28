"use client";

import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Avatar, Badge, Button, EmptyState, StatCardSkeleton } from "@/components/ui";
import type { User } from "@/lib/auth";
import { useDashboardMyRequests, useDashboardStats } from "../hooks/useDashboardData";
import { dashboardKeys } from "../hooks/keys";
import { useFrequentVisitors } from "@/features/visitors";
import { useApproveVisit, useRejectVisit } from "@/features/visitors";

interface ResidentDashboardProps {
  user: User;
}

export function ResidentDashboard({ user }: ResidentDashboardProps) {
  const queryClient = useQueryClient();
  const statsQ = useDashboardStats(true);
  const myReqQ = useDashboardMyRequests(true);
  const frequentQ = useFrequentVisitors(true);
  const approveMutation = useApproveVisit();
  const rejectMutation = useRejectVisit();

  const stats = statsQ.data;
  const pending = myReqQ.data?.visits ?? [];
  const frequent = (frequentQ.data ?? []).slice(0, 8);
  const loading = statsQ.isLoading || myReqQ.isLoading || frequentQ.isLoading;

  const approvingId = approveMutation.isPending
    ? (approveMutation.variables as string)
    : null;
  const rejectingId = rejectMutation.isPending
    ? (rejectMutation.variables as string)
    : null;

  const handleApprove = async (visitId: string) => {
    await approveMutation.mutateAsync(visitId);
    queryClient.invalidateQueries({ queryKey: dashboardKeys.myRequests() });
  };

  const handleReject = async (visitId: string) => {
    await rejectMutation.mutateAsync(visitId);
    queryClient.invalidateQueries({ queryKey: dashboardKeys.myRequests() });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Resident Dashboard
          </h1>
          <p className="text-muted-foreground">Welcome, {user.username}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/visitors/invite">
            <Button>+ Invite Visitor</Button>
          </Link>
          <Link href="/visitors/frequent">
            <Button variant="secondary">Frequent Visitors</Button>
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-muted-foreground text-sm">Total Today</p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {stats?.visitors_today ?? 0}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-muted-foreground text-sm">Pending Approvals</p>
          <p className="text-2xl font-bold text-warning mt-1">
            {stats?.pending_approvals ?? pending.length}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-muted-foreground text-sm">Checked In</p>
          <p className="text-2xl font-bold text-success mt-1">
            {stats?.checked_in ?? 0}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-muted-foreground text-sm">My Requests</p>
          <p className="text-2xl font-bold text-primary mt-1">
            {myReqQ.data?.count ?? pending.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">
              Pending approvals ({pending.length})
            </h2>
          </div>

          {pending.length === 0 ? (
            <EmptyState
              title="No approvals pending"
              description="When someone arrives at the gate for you, you’ll see it here."
            />
          ) : (
            <div className="divide-y divide-border">
              {pending.map((v) => (
                <div key={v.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={v.visitor_name} size="md" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-foreground">{v.visitor_name}</p>
                        {v.is_walkin && (
                          <Badge variant="default" className="ml-2">
                            Walk-in
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {v.purpose || "Visit"} {v.visitor_phone ? `· ${v.visitor_phone}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(v.id)}
                      loading={approvingId === v.id}
                      disabled={approvingId === v.id || rejectingId === v.id}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleReject(v.id)}
                      loading={rejectingId === v.id}
                      disabled={approvingId === v.id || rejectingId === v.id}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">
              Frequent visitors
            </h2>
          </div>

          {frequent.length === 0 ? (
            <EmptyState
              title="No frequent visitors yet"
              description="Invite visitors and they’ll show up here for quick access."
              action={
                <Link href="/visitors/invite">
                  <Button>Invite visitor</Button>
                </Link>
              }
            />
          ) : (
            <div className="divide-y divide-border">
              {frequent.map((fv) => (
                <div key={fv.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={fv.name} size="md" />
                    <div>
                      <p className="font-medium text-foreground">{fv.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {fv.purpose} · {fv.visit_count} visits · Last: {fv.last_visit ?? "—"}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/visitors/invite?name=${encodeURIComponent(fv.name)}&phone=${encodeURIComponent(fv.phone)}&purpose=${encodeURIComponent(fv.purpose)}`}
                  >
                    <Button size="sm" variant="secondary">
                      Invite again
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

