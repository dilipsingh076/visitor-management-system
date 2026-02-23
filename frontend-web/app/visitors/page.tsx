"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import { isAuthenticated, getDemoUser, canInviteVisitor, getPrimaryRole } from "@/lib/auth";
import Link from "next/link";
import { API } from "@/lib/api/endpoints";
import { PageHeader, LinkButton, Card } from "@/components/ui";
import type { User } from "@/lib/auth";

interface Visit {
  id: string;
  visitor_name: string;
  visitor_phone: string;
  status: string;
  purpose?: string;
  otp?: string;
  created_at: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

function VisitorsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") || "";
  const [user, setUser] = useState<User | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) router.push("/login");
    const demo = getDemoUser();
    if (demo) setUser(demo);
    else apiClient.get<User>(API.auth.me).then((r) => r.data && setUser(r.data));
  }, [router]);

  const fetchData = async () => {
    const role = user ? getPrimaryRole(user) : "resident";
    const base = statusFilter ? `${API.visitors.list}?status=${statusFilter}` : API.visitors.list;
    const hostParam = role === "resident" ? "host_id=me" : "";
    const url = hostParam ? `${base}${base.includes("?") ? "&" : "?"}${hostParam}` : base;
    const [vRes, nRes] = await Promise.all([
      apiClient.get<Visit[]>(url),
      role === "resident" || role === "admin" ? apiClient.get<Notification[]>(`${API.notifications.list}?unread_only=true`) : Promise.resolve({ data: [] as Notification[] }),
    ]);
    if (vRes.data) setVisits(Array.isArray(vRes.data) ? vRes.data : []);
    if (nRes.data) setNotifications(Array.isArray(nRes.data) ? nRes.data : []);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchData();
  }, [statusFilter, user]);

  const markNotificationRead = async (id: string) => {
    await apiClient.patch(API.notifications.markRead(id));
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleApprove = async (visitId: string) => {
    setApproving(visitId);
    const res = await apiClient.patch<Visit>(API.visitors.approve(visitId));
    setApproving(null);
    if (res.data) {
      setVisits((prev) =>
        prev.map((v) => (v.id === visitId ? { ...v, status: "approved" } : v))
      );
    }
  };

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      pending: "bg-warning-light text-warning",
      approved: "bg-info-light text-info",
      checked_in: "bg-success-light text-success",
      checked_out: "bg-muted-bg text-foreground",
      cancelled: "bg-error-light text-error",
    };
    return map[s] || "bg-muted-bg text-foreground";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title="Visitors"
        description={canInviteVisitor(user) ? "Manage visits. Pending invites need your approval before visitor can check in." : "View visits. Guards see all; residents see their own."}
        action={canInviteVisitor(user) ? <LinkButton href="/visitors/invite" variant="primary" size="md">+ Invite Visitor</LinkButton> : undefined}
      />

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="mb-6 space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="flex items-center justify-between p-4 bg-success-light border border-success/30 rounded-xl"
            >
              <div>
                <p className="font-medium text-success">{n.title}</p>
                <p className="text-sm text-muted">{n.body}</p>
                <p className="text-xs text-muted mt-1">{new Date(n.created_at).toLocaleString()}</p>
              </div>
              <button
                onClick={() => markNotificationRead(n.id)}
                className="px-3 py-1.5 text-sm bg-success text-white rounded-lg hover:bg-green-700"
              >
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-6">
        <Link
          href="/visitors"
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            !statusFilter ? "bg-border text-foreground" : "bg-muted-bg text-muted hover:bg-border"
          }`}
        >
          All
        </Link>
        <Link
          href="/visitors?status=pending"
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            statusFilter === "pending" ? "bg-warning-light text-warning" : "bg-muted-bg text-muted hover:bg-border"
          }`}
        >
          Pending approval
        </Link>
        <Link
          href="/visitors?status=approved"
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            statusFilter === "approved" ? "bg-info-light text-info" : "bg-muted-bg text-muted hover:bg-border"
          }`}
        >
          Approved
        </Link>
        <Link
          href="/visitors?status=checked_in"
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            statusFilter === "checked_in" ? "bg-primary-light text-primary" : "bg-muted-bg text-muted hover:bg-border"
          }`}
        >
          Checked in
        </Link>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Loading...</div>
        ) : visits.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground mb-4">
              {statusFilter ? `No ${statusFilter.replace("_", " ")} visits` : "No visits yet"}
            </p>
            {!statusFilter && (
              <Link href="/visitors/invite" className="text-primary hover:underline">
                Invite your first visitor
              </Link>
            )}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Visitor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Purpose</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visits.map((v) => (
                <tr key={v.id} className="hover:bg-background">
                  <td className="px-6 py-4 font-medium text-foreground">{v.visitor_name}</td>
                  <td className="px-6 py-4 text-muted">{v.visitor_phone}</td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(v.status)}`}>
                      {v.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted">{v.purpose || "-"}</td>
                  <td className="px-6 py-4 text-muted">{new Date(v.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    {v.status === "pending" && canInviteVisitor(user) && (
                      <button
                        onClick={() => handleApprove(v.id)}
                        disabled={approving === v.id}
                        className="px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover disabled:opacity-50"
                      >
                        {approving === v.id ? "..." : "Approve"}
                      </button>
                    )}
                    {v.status === "approved" && v.otp && (
                      <span className="text-xs text-muted-foreground">OTP: {v.otp}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

export default function VisitorsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-10 text-muted-foreground">Loading...</div>}>
      <VisitorsContent />
    </Suspense>
  );
}
