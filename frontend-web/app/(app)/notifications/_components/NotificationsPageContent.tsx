"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import {
  PageHeader,
  Card,
  CardHeader,
  CardContent,
  Button,
  Input,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Badge,
  FilterChip,
  EmptyState,
} from "@/components/ui";
import { PageWrapper } from "@/components/common";
import { Bell } from "lucide-react";
import { useAuth } from "@/features/auth";
import { getPrimaryRole, isCommittee } from "@/lib/auth";
import { useNotifications, useMarkNotificationRead, useCreateSocietyNotice, useGenerateNoticeMessage, useNotificationsStream, useApproveVisit, useRejectVisit } from "@/features/visitors";

type NotificationCategory = "all" | "visitor" | "society" | "security" | "payments" | "other";

function getCategory(type: string): NotificationCategory {
  if (type === "society_notice") return "society";
  if (type === "visitor_arrived" || type === "walkin_pending") return "visitor";
  if (type.includes("security")) return "security";
  if (type.includes("payment") || type.includes("maintenance")) return "payments";
  return "other";
}

function parseExtra(extra: string | null | undefined): Record<string, unknown> | null {
  if (!extra) return null;
  try {
    return JSON.parse(extra) as Record<string, unknown>;
  } catch {
    return null;
  }
}

type SosSeverity = "critical" | "high" | "medium" | "low";

function getSosType(extra: string | null | undefined): string | null {
  const parsed = parseExtra(extra);
  const t = parsed && typeof parsed["type"] === "string" ? (parsed["type"] as string) : null;
  return t ? t.toLowerCase() : null;
}

function getSosSeverity(sosType: string | null): SosSeverity {
  switch (sosType) {
    case "fire":
      return "critical";
    case "theft":
      return "high";
    case "medical":
      return "high";
    case "lift":
      return "medium";
    case "other":
    default:
      return "low";
  }
}

function sosHighlightClasses(sev: SosSeverity): { wrapper: string; badge: string; badgeText: string } {
  switch (sev) {
    case "critical":
      return {
        wrapper: "border-l-4 border-red-600 bg-red-600/5",
        badge: "bg-red-600/10 text-red-700 border border-red-600/20",
        badgeText: "CRITICAL",
      };
    case "high":
      return {
        wrapper: "border-l-4 border-orange-600 bg-orange-600/5",
        badge: "bg-orange-600/10 text-orange-700 border border-orange-600/20",
        badgeText: "HIGH",
      };
    case "medium":
      return {
        wrapper: "border-l-4 border-amber-600 bg-amber-600/5",
        badge: "bg-amber-600/10 text-amber-700 border border-amber-600/20",
        badgeText: "MEDIUM",
      };
    case "low":
    default:
      return {
        wrapper: "border-l-4 border-yellow-600 bg-yellow-600/5",
        badge: "bg-yellow-600/10 text-yellow-700 border border-yellow-600/20",
        badgeText: "LOW",
      };
  }
}

export function NotificationsPageContent() {
  const { user, loading: authLoading } = useAuth({ requireAuth: true });
  const role = getPrimaryRole(user);
  const canPostNotice = isCommittee(role);
  useNotificationsStream(Boolean(user) && (role === "resident" || canPostNotice));

  const [tab, setTab] = useState<"unread" | "all">("unread");
  const [category, setCategory] = useState<NotificationCategory>("all");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const unreadOnly = tab === "unread";
  const listQ = useNotifications({ enabled: Boolean(user), unreadOnly });
  const markRead = useMarkNotificationRead();
  const createNotice = useCreateSocietyNotice();
  const generateMessage = useGenerateNoticeMessage();

  const notifications = listQ.data ?? [];
  const loading = authLoading || listQ.isLoading;

  const items = useMemo(() => {
    const mapped = notifications.map((n) => {
      const extra = parseExtra(n.extra_data);
      const visitId = extra && typeof extra["visit_id"] === "string" ? (extra["visit_id"] as string) : null;
      return { ...n, visitId, category: getCategory(n.type), extra_data: n.extra_data };
    });
    if (category === "all") return mapped;
    return mapped.filter((n) => n.category === category);
  }, [notifications, category]);

  const handleGenerateMessage = async () => {
    const t = title.trim();
    if (!t) return;
    try {
      const message = await generateMessage.mutateAsync({ title: t });
      setBody(message);
    } catch {
      // Error shown via generateMessage.isError
    }
  };

  const submitNotice = async () => {
    const t = title.trim();
    if (!t) return;
    await createNotice.mutateAsync({ title: t, body: body.trim() || undefined });
    setTitle("");
    setBody("");
    setTab("unread");
  };

  if (!user) return null;

  return (
    <PageWrapper>
      <PageHeader
        title="Notifications"
        description="Visitor alerts and society notices."
      />

      {canPostNotice && (
        <Card variant="outlined" className="mb-4 overflow-hidden">
          <CardHeader className="border-b border-border py-3">
            <span className="text-sm font-semibold text-foreground">Post society notice</span>
          </CardHeader>
          <CardContent className="py-4 space-y-3">
            <Input
              id="noticeTitle"
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Water supply maintenance tomorrow 10 AM"
            />
            <div className="mb-4">
              <label htmlFor="noticeBody" className="block text-sm font-medium text-foreground mb-1">Message (optional)</label>
              <textarea
                id="noticeBody"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Add details (time, building, contact person)…"
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition text-sm resize-y"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="xs"
                variant="outline"
                onClick={handleGenerateMessage}
                disabled={!title.trim() || generateMessage.isPending}
              >
                {generateMessage.isPending ? (
                  <>
                    <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate with AI"
                )}
              </Button>
              {generateMessage.isError && (
                <span className="text-xs text-destructive">AI unavailable. Please write manually.</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={submitNotice} loading={createNotice.isPending} disabled={!title.trim()}>
                Post notice
              </Button>
              {createNotice.isSuccess && (
                <span className="text-xs text-success">Notice posted</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="unread" value={tab} onValueChange={(v) => setTab(v as "unread" | "all")}>
        <TabsList className="p-1 h-10">
          <TabsTrigger value="unread" className="h-8 px-4 py-0 leading-none">Unread</TabsTrigger>
          <TabsTrigger value="all" className="h-8 px-4 py-0 leading-none">All</TabsTrigger>
        </TabsList>

        <TabsContent value="unread" className="mt-4">
          <CategoryFilter category={category} setCategory={setCategory} />
          <NotificationsList loading={loading} items={items} markRead={markRead} showActions />
        </TabsContent>
        <TabsContent value="all" className="mt-4">
          <CategoryFilter category={category} setCategory={setCategory} />
          <NotificationsList loading={loading} items={items} markRead={markRead} showActions />
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}

function CategoryFilter(props: { category: NotificationCategory; setCategory: (c: NotificationCategory) => void }) {
  const { category, setCategory } = props;
  const options: Array<{ id: NotificationCategory; label: string }> = [
    { id: "all", label: "All" },
    { id: "visitor", label: "Visitor" },
    { id: "society", label: "Society" },
    { id: "security", label: "Security" },
    { id: "payments", label: "Payments" },
    { id: "other", label: "Other" },
  ];
  return (
    <div className="mb-3 flex flex-wrap gap-1.5">
      {options.map((o) => (
        <FilterChip key={o.id} selected={category === o.id} onClick={() => setCategory(o.id)}>
          {o.label}
        </FilterChip>
      ))}
    </div>
  );
}

function NotificationsList(props: {
  loading: boolean;
  items: Array<{ id: string; type: string; title: string; body: string; read: boolean; created_at: string; visitId: string | null; extra_data?: string | null }>;
  markRead: ReturnType<typeof useMarkNotificationRead>;
  showActions?: boolean;
}) {
  const { loading, items, markRead, showActions } = props;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const approveMutation = useApproveVisit();
  const rejectMutation = useRejectVisit();
  const [actionedIds, setActionedIds] = useState<Set<string>>(new Set());

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  if (loading) {
    return (
      <Card className="overflow-hidden rounded-lg">
        <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="overflow-hidden rounded-lg">
        <EmptyState
          icon={<Bell className="w-6 h-6" />}
          title="No notifications"
          description="You're all caught up! Notifications will appear here when there's activity."
        />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-lg">
      <div className="divide-y divide-border">
        {items.map((n) => {
          const isExpanded = expandedId === n.id;
          const isSos = n.type === "sos_alert";
          const sosType = isSos ? getSosType(n.extra_data) : null;
          const sev = isSos ? getSosSeverity(sosType) : null;
          const hl = sev ? sosHighlightClasses(sev) : null;
          return (
            <div key={n.id} className={`px-4 py-3 ${hl?.wrapper ?? ""}`.trim()}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium text-foreground ${isExpanded ? "" : "truncate"}`}>{n.title}</p>
                    {!n.read && <Badge variant="primary" size="sm">New</Badge>}
                    {isSos && hl && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${hl.badge}`.trim()}>
                        SOS · {hl.badgeText}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{new Date(n.created_at).toLocaleString()}</p>
                  {n.body && (
                    <p className={`text-sm text-muted-foreground mt-1 ${isExpanded ? "whitespace-pre-wrap" : "line-clamp-2"}`}>{n.body}</p>
                  )}
                  {n.visitId && (
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <Link href={`/visitors/${encodeURIComponent(n.visitId)}`} className="text-sm font-medium text-primary hover:underline">
                        Open visit →
                      </Link>
                      {showActions && n.type === "walkin_pending" && !n.read && !actionedIds.has(n.id) && (
                        <>
                          <Button
                            size="xs"
                            variant="primary"
                            onClick={() => {
                              approveMutation.mutate(n.visitId!, {
                                onSuccess: () => {
                                  setActionedIds((prev) => new Set(prev).add(n.id));
                                  markRead.mutate(n.id);
                                },
                              });
                            }}
                            disabled={approveMutation.isPending}
                          >
                            {approveMutation.isPending ? "…" : "Approve"}
                          </Button>
                          <Button
                            size="xs"
                            variant="danger"
                            onClick={() => {
                              rejectMutation.mutate(n.visitId!, {
                                onSuccess: () => {
                                  setActionedIds((prev) => new Set(prev).add(n.id));
                                  markRead.mutate(n.id);
                                },
                              });
                            }}
                            disabled={rejectMutation.isPending}
                          >
                            {rejectMutation.isPending ? "…" : "Reject"}
                          </Button>
                        </>
                      )}
                      {actionedIds.has(n.id) && (
                        <span className="text-xs text-muted-foreground">Done</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="shrink-0 flex gap-2">
                  {!n.read && (
                    <Button size="xs" variant="secondary" onClick={() => markRead.mutate(n.id)} disabled={markRead.isPending}>
                      Mark read
                    </Button>
                  )}
                </div>
              </div>
              {n.body && (
                <button
                  type="button"
                  onClick={() => toggleExpand(n.id)}
                  className="text-xs font-medium text-primary hover:underline mt-1"
                >
                  {isExpanded ? "Show less" : "View full"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

