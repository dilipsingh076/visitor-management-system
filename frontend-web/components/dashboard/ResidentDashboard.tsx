"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { API } from "@/lib/api/endpoints";
import { Avatar, Badge, Button, EmptyState, StatCardSkeleton } from "@/components/ui";
import type { User } from "@/lib/auth";

interface Stats {
  visitors_today: number;
  pending_approvals: number;
  checked_in: number;
}

interface PendingVisitor {
  id: string;
  visitor_name: string;
  visitor_phone?: string;
  purpose?: string;
  is_walkin?: boolean;
  created_at?: string;
}

interface MyRequests {
  count: number;
  visits: PendingVisitor[];
}

interface FrequentVisitor {
  id: string;
  name: string;
  phone: string;
  purpose: string;
  visit_count: number;
  last_visit?: string;
}

interface ResidentDashboardProps {
  user: User;
}

export function ResidentDashboard({ user }: ResidentDashboardProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<MyRequests | null>(null);
  const [frequentVisitors, setFrequentVisitors] = useState<FrequentVisitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, myReqRes] = await Promise.all([
        apiClient.get<Stats>(API.dashboard.stats),
        apiClient.get<MyRequests>(API.dashboard.myRequests),
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (myReqRes.data) setPendingApprovals(myReqRes.data);

      // Fetch frequent visitors (mock for now - you can add this endpoint later)
      setFrequentVisitors([
        { id: "1", name: "Ramesh (Maid)", phone: "9876543210", purpose: "Domestic Help", visit_count: 24, last_visit: "Today" },
        { id: "2", name: "Suresh (Driver)", phone: "9876543211", purpose: "Driver", visit_count: 18, last_visit: "Yesterday" },
      ]);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (visitId: string) => {
    setApproving(visitId);
    try {
      await apiClient.post(`${API.visitors.base}/${visitId}/approve`, {});
      setPendingApprovals((prev) =>
        prev
          ? { count: prev.count - 1, visits: prev.visits.filter((v) => v.id !== visitId) }
          : null
      );
    } catch (error) {
      console.error("Failed to approve:", error);
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (visitId: string) => {
    setApproving(visitId);
    try {
      await apiClient.post(`${API.visitors.base}/${visitId}/reject`, {});
      setPendingApprovals((prev) =>
        prev
          ? { count: prev.count - 1, visits: prev.visits.filter((v) => v.id !== visitId) }
          : null
      );
    } catch (error) {
      console.error("Failed to reject:", error);
    } finally {
      setApproving(null);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {getGreeting()}, {user.username}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your visitors today
          </p>
        </div>
        <Link href="/visitors/invite">
          <Button size="lg" className="hidden md:flex gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Invite Visitor
          </Button>
        </Link>
      </div>

      {/* Quick Actions - Mobile */}
      <div className="grid grid-cols-2 gap-4 md:hidden">
        <Link
          href="/visitors/invite"
          className="bg-primary text-white rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-primary-hover transition"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <span className="font-medium text-sm">Invite Visitor</span>
        </Link>
        <Link
          href="/visitors"
          className="bg-card border border-border rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-muted-bg transition"
        >
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="font-medium text-sm text-foreground">My Visitors</span>
        </Link>
      </div>

      {/* Pending Approvals Alert */}
      {pendingApprovals && pendingApprovals.count > 0 && (
        <div className="bg-gradient-to-r from-warning/10 to-warning/5 border border-warning/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-warning mb-1">
                {pendingApprovals.count} Visitor{pendingApprovals.count > 1 ? "s" : ""} Waiting for Approval
              </h2>
              <p className="text-muted-foreground text-sm mb-4">
                Walk-in visitors registered by guard need your approval
              </p>

              <div className="space-y-3">
                {pendingApprovals.visits.slice(0, 3).map((visitor) => (
                  <div
                    key={visitor.id}
                    className="flex items-center justify-between bg-card rounded-lg p-3 border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={visitor.visitor_name} size="md" />
                      <div>
                        <p className="font-medium text-foreground">{visitor.visitor_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {visitor.purpose || "Visit"} {visitor.is_walkin && <Badge variant="secondary" className="ml-2">Walk-in</Badge>}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleReject(visitor.id)}
                        disabled={approving === visitor.id}
                        className="text-error hover:bg-error/10"
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(visitor.id)}
                        disabled={approving === visitor.id}
                        loading={approving === visitor.id}
                      >
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {pendingApprovals.count > 3 && (
                <Link
                  href="/visitors?status=pending"
                  className="inline-block mt-3 text-warning font-medium text-sm hover:underline"
                >
                  View all {pendingApprovals.count} pending →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground text-sm font-medium">Visitors Today</span>
            <span className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
          </div>
          <p className="text-3xl font-bold text-primary">{stats?.visitors_today ?? 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Total visits scheduled</p>
        </div>

        <Link href="/visitors?status=pending" className="bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition block">
          <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground text-sm font-medium">Pending Approvals</span>
            <span className="w-10 h-10 rounded-lg bg-warning-light flex items-center justify-center">
              <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <p className="text-3xl font-bold text-warning">{stats?.pending_approvals ?? 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Tap to review & approve</p>
        </Link>

        <div className="bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground text-sm font-medium">Currently Inside</span>
            <span className="w-10 h-10 rounded-lg bg-success-light flex items-center justify-center">
              <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <p className="text-3xl font-bold text-success">{stats?.checked_in ?? 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Visitors checked in</p>
        </div>
      </div>

      {/* Frequent Visitors */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-5 rounded bg-primary" />
            <h2 className="text-lg font-semibold text-foreground">Frequent Visitors</h2>
          </div>
          <Link href="/visitors/frequent" className="text-sm text-primary hover:underline">
            Manage →
          </Link>
        </div>

        {frequentVisitors.length > 0 ? (
          <div className="divide-y divide-border">
            {frequentVisitors.map((visitor) => (
              <div key={visitor.id} className="p-4 flex items-center justify-between hover:bg-muted-bg/50 transition">
                <div className="flex items-center gap-3">
                  <Avatar name={visitor.name} size="md" />
                  <div>
                    <p className="font-medium text-foreground">{visitor.name}</p>
                    <p className="text-sm text-muted-foreground">{visitor.purpose}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {visitor.visit_count} visits · {visitor.last_visit}
                  </span>
                  <Button size="sm" variant="secondary">
                    Quick Invite
                  </Button>
                </div>
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
            description="Visitors you invite multiple times will appear here for quick re-invitation"
          />
        )}
      </div>
    </div>
  );
}
