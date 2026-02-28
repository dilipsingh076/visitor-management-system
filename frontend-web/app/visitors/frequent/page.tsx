"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { canInviteVisitor } from "@/lib/auth";
import { useAuth } from "@/features/auth";
import { Avatar, Button, Input, EmptyState, PageHeader } from "@/components/ui";
import { useFrequentVisitors, type FrequentVisitor } from "@/features/visitors";

export default function FrequentVisitorsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth({
    requireAuth: true,
    requireRole: canInviteVisitor,
    redirectTo: "/dashboard",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const frequentQ = useFrequentVisitors(Boolean(user));
  const visitors = frequentQ.data ?? [];
  const loading = frequentQ.isLoading;

  const handleQuickInvite = (visitor: FrequentVisitor) => {
    router.push(`/visitors/invite?name=${encodeURIComponent(visitor.name)}&phone=${encodeURIComponent(visitor.phone)}&purpose=${encodeURIComponent(visitor.purpose)}`);
  };

  const filteredVisitors = visitors.filter(
    (v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.phone.includes(searchQuery) ||
      v.purpose.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || !user) return null;
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted-bg rounded w-48" />
          <div className="h-12 bg-muted-bg rounded" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted-bg rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title="Frequent Visitors"
        description="Visitors from your visit history — invite again quickly"
        action={
          <Link href="/visitors/invite">
            <Button>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Invite Visitor
            </Button>
          </Link>
        }
      />

      <div className="relative mb-6">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <Input
          placeholder="Search by name, phone, or purpose..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredVisitors.length > 0 ? (
        <div className="bg-card rounded-xl border border-border overflow-hidden divide-y divide-border">
          {filteredVisitors.map((visitor) => (
            <div key={visitor.id} className="p-4 flex items-center justify-between hover:bg-muted-bg/50 transition">
              <div className="flex items-center gap-3">
                <Avatar name={visitor.name} size="lg" />
                <div>
                  <p className="font-semibold text-foreground">{visitor.name}</p>
                  <p className="text-sm text-muted-foreground">{visitor.purpose}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {visitor.visit_count} visits · Last: {visitor.last_visit}
                  </p>
                </div>
              </div>
              <Button size="sm" onClick={() => handleQuickInvite(visitor)}>
                Quick Invite
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          title="No frequent visitors yet"
          description="Visitors you invite will appear here after they have visited. Use Invite Visitor to add someone new."
          action={
            <Link href="/visitors/invite">
              <Button>Invite Visitor</Button>
            </Link>
          }
        />
      )}
    </div>
  );
}
