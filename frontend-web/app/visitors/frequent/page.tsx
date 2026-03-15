"use client";

import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { canInviteVisitor } from "@/lib/auth";
import { useAuth } from "@/features/auth";
import { Button, EmptyState, PageHeader } from "@/components/ui";
import { useFrequentVisitorsPage } from "@/features/visitors";
import { PageWrapper, PageLoadingSkeleton, SearchInput } from "@/components/common";
import { theme } from "@/lib/theme";
import { Avatar } from "@/components/ui";

export default function FrequentVisitorsPage() {
  const { user, loading: authLoading } = useAuth({
    requireAuth: true,
    requireRole: canInviteVisitor,
    redirectTo: "/dashboard",
  });
  const { visitors, searchQuery, setSearchQuery, loading, handleQuickInvite } = useFrequentVisitorsPage(user ?? null);

  if (authLoading || !user) return null;

  if (loading) {
    return (
      <PageWrapper>
        <PageLoadingSkeleton rows={6} showInput />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageHeader
        title="Frequent Visitors"
        description="Visitors from your visit history — invite again quickly"
        action={
          <Link href="/visitors/invite">
            <Button size="sm">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Invite Visitor
            </Button>
          </Link>
        }
      />

      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by name, phone, or purpose..."
        className="mb-4"
        aria-label="Search frequent visitors"
      />

      {visitors.length > 0 ? (
        <div className={theme.list.card}>
          {visitors.map((visitor) => (
            <div
              key={visitor.id}
              className={`p-3 flex items-center justify-between ${theme.list.rowHover}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Avatar name={visitor.name} size="sm" />
                <div className="min-w-0">
                  <p className={`font-medium text-sm text-foreground truncate ${theme.text.body}`}>{visitor.name}</p>
                  <p className={`text-xs text-muted-foreground truncate ${theme.text.mutedSmall}`}>{visitor.purpose}</p>
                  <p className={`text-xs text-muted-foreground mt-0.5 ${theme.text.mutedSmall}`}>
                    {visitor.visit_count} visits · Last: {visitor.last_visit}
                  </p>
                </div>
              </div>
              <Button size="sm" onClick={() => handleQuickInvite(visitor)} className="shrink-0">
                Quick Invite
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Users className="w-8 h-8 text-muted-foreground" />}
          title="No frequent visitors yet"
          description="Visitors you invite will appear here after they have visited. Use Invite Visitor to add someone new."
          action={
            <Link href="/visitors/invite">
              <Button>Invite Visitor</Button>
            </Link>
          }
        />
      )}
    </PageWrapper>
  );
}
