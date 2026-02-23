"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { API } from "@/lib/api/endpoints";
import { Avatar, Badge, Button, Input, EmptyState, StatCardSkeleton } from "@/components/ui";
import type { User } from "@/lib/auth";

interface Stats {
  visitors_today: number;
  pending_approvals: number;
  checked_in: number;
}

interface Visitor {
  id: string;
  visitor_name: string;
  visitor_phone?: string;
  purpose?: string;
  flat_number?: string;
  host_name?: string;
  status: string;
  check_in_time?: string;
  otp?: string;
  is_walkin?: boolean;
}

interface GuardDashboardProps {
  user: User;
}

const STATUS_COLORS: Record<string, "success" | "warning" | "error" | "info" | "secondary"> = {
  checked_in: "success",
  approved: "info",
  pending: "warning",
  checked_out: "secondary",
  rejected: "error",
  expired: "error",
};

export function GuardDashboard({ user }: GuardDashboardProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [expectedVisitors, setExpectedVisitors] = useState<Visitor[]>([]);
  const [checkedInVisitors, setCheckedInVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, expectedRes, checkedInRes] = await Promise.all([
        apiClient.get<Stats>(API.dashboard.stats),
        apiClient.get<{ visits: Visitor[] }>(`${API.visitors.base}?status=approved&limit=20`),
        apiClient.get<{ visits: Visitor[] }>(`${API.visitors.base}?status=checked_in&limit=20`),
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (expectedRes.data) setExpectedVisitors(expectedRes.data.visits || []);
      if (checkedInRes.data) setCheckedInVisitors(checkedInRes.data.visits || []);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleQuickCheckIn = async (visitId: string) => {
    setCheckingIn(visitId);
    try {
      await apiClient.post(`${API.checkin.base}/${visitId}`, {});
      await fetchData();
    } catch (error) {
      console.error("Failed to check in:", error);
    } finally {
      setCheckingIn(null);
    }
  };

  const handleCheckOut = async (visitId: string) => {
    setCheckingIn(visitId);
    try {
      await apiClient.post(`${API.checkin.checkout}/${visitId}`, {});
      await fetchData();
    } catch (error) {
      console.error("Failed to check out:", error);
    } finally {
      setCheckingIn(null);
    }
  };

  const handleMusterExport = async () => {
    try {
      const response = await fetch(`${API.dashboard.muster}`, {
        credentials: "include",
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `muster-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export muster:", error);
    }
  };

  const filteredExpected = expectedVisitors.filter(
    (v) =>
      v.visitor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.visitor_phone?.includes(searchQuery) ||
      v.flat_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-success animate-pulse" />
            Security Desk
          </h1>
          <p className="text-muted-foreground">Welcome, {user.username}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleMusterExport}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Muster Export
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <Input
          placeholder="Search by name, phone, or flat number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-14 text-lg"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/checkin"
          className="bg-primary text-white rounded-xl p-4 md:p-6 flex flex-col items-center justify-center gap-2 hover:bg-primary-hover transition shadow-lg shadow-primary/20"
        >
          <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          <span className="font-semibold text-sm md:text-base">Scan QR / OTP</span>
        </Link>

        <Link
          href="/checkin/walkin"
          className="bg-warning text-white rounded-xl p-4 md:p-6 flex flex-col items-center justify-center gap-2 hover:bg-warning-hover transition shadow-lg shadow-warning/20"
        >
          <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <span className="font-semibold text-sm md:text-base">Walk-in Entry</span>
        </Link>

        <Link
          href="/blacklist"
          className="bg-card border border-border rounded-xl p-4 md:p-6 flex flex-col items-center justify-center gap-2 hover:bg-muted-bg transition"
        >
          <svg className="w-8 h-8 md:w-10 md:h-10 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          <span className="font-semibold text-sm md:text-base text-foreground">Blacklist</span>
        </Link>

        <Link
          href="/visitors"
          className="bg-card border border-border rounded-xl p-4 md:p-6 flex flex-col items-center justify-center gap-2 hover:bg-muted-bg transition"
        >
          <svg className="w-8 h-8 md:w-10 md:h-10 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="font-semibold text-sm md:text-base text-foreground">All Visitors</span>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-muted-foreground text-sm">Expected Today</p>
          <p className="text-2xl font-bold text-primary mt-1">{expectedVisitors.length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-muted-foreground text-sm">Currently Inside</p>
          <p className="text-2xl font-bold text-success mt-1">{stats?.checked_in ?? 0}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-muted-foreground text-sm">Pending Approval</p>
          <p className="text-2xl font-bold text-warning mt-1">{stats?.pending_approvals ?? 0}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-muted-foreground text-sm">Total Today</p>
          <p className="text-2xl font-bold text-foreground mt-1">{stats?.visitors_today ?? 0}</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expected Visitors */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-primary/5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Expected Today ({filteredExpected.length})
              </h2>
            </div>
          </div>

          {filteredExpected.length > 0 ? (
            <div className="divide-y divide-border max-h-96 overflow-y-auto">
              {filteredExpected.map((visitor) => (
                <div key={visitor.id} className="p-4 hover:bg-muted-bg/50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar name={visitor.visitor_name} size="md" />
                      <div>
                        <p className="font-medium text-foreground">{visitor.visitor_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {visitor.flat_number && `Flat ${visitor.flat_number} · `}
                          {visitor.purpose || "Visit"}
                        </p>
                        {visitor.otp && (
                          <p className="text-xs font-mono text-primary mt-1">OTP: {visitor.otp}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleQuickCheckIn(visitor.id)}
                      loading={checkingIn === visitor.id}
                      disabled={checkingIn === visitor.id}
                    >
                      Check In
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              title={searchQuery ? "No matching visitors" : "No expected visitors"}
              description={searchQuery ? "Try a different search term" : "No approved visitors scheduled for today yet"}
            />
          )}
        </div>

        {/* Currently Inside */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-success/5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Currently Inside ({checkedInVisitors.length})
              </h2>
            </div>
          </div>

          {checkedInVisitors.length > 0 ? (
            <div className="divide-y divide-border max-h-96 overflow-y-auto">
              {checkedInVisitors.map((visitor) => (
                <div key={visitor.id} className="p-4 hover:bg-muted-bg/50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar name={visitor.visitor_name} size="md" />
                      <div>
                        <p className="font-medium text-foreground">{visitor.visitor_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {visitor.flat_number && `Flat ${visitor.flat_number} · `}
                          {visitor.check_in_time && `In: ${new Date(visitor.check_in_time).toLocaleTimeString()}`}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleCheckOut(visitor.id)}
                      loading={checkingIn === visitor.id}
                      disabled={checkingIn === visitor.id}
                    >
                      Check Out
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
              title="No visitors inside"
              description="All visitors have checked out"
            />
          )}
        </div>
      </div>
    </div>
  );
}
