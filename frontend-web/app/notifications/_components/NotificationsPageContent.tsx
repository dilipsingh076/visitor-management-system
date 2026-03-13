"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader, Card, CardHeader, CardContent, Button, Input, Tabs, TabsList, TabsTrigger, TabsContent, Badge } from "@/components/ui";
import { PageWrapper } from "@/components/common";
import { theme } from "@/lib/theme";
import { useAuth } from "@/features/auth";
import { getPrimaryRole, isCommittee } from "@/lib/auth";
import { useNotifications, useMarkNotificationRead, useCreateSocietyNotice, useNotificationsStream } from "@/features/visitors";

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

  const notifications = listQ.data ?? [];
  const loading = authLoading || listQ.isLoading;

  const items = useMemo(() => {
    const mapped = notifications.map((n) => {
      const extra = parseExtra(n.extra_data);
      const visitId = extra && typeof extra["visit_id"] === "string" ? (extra["visit_id"] as string) : null;
      return { ...n, visitId, category: getCategory(n.type) };
    });
    if (category === "all") return mapped;
    return mapped.filter((n) => n.category === category);
  }, [notifications, category]);

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
            <Input
              id="noticeBody"
              label="Message (optional)"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Add details (time, building, contact person)…"
            />
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
          <TabsTrigger value="unread" className="text-sm px-4 py-2">Unread</TabsTrigger>
          <TabsTrigger value="all" className="text-sm px-4 py-2">All</TabsTrigger>
        </TabsList>

        <TabsContent value="unread" className="mt-4">
          <CategoryFilter category={category} setCategory={setCategory} />
          <NotificationsList loading={loading} items={items} markRead={markRead} />
        </TabsContent>
        <TabsContent value="all" className="mt-4">
          <CategoryFilter category={category} setCategory={setCategory} />
          <NotificationsList loading={loading} items={items} markRead={markRead} />
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
    <div className="flex gap-1.5 mb-3 flex-wrap">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => setCategory(o.id)}
          className={`${theme.filterPill.base} ${category === o.id ? theme.filterPill.active : theme.filterPill.inactive}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function NotificationsList(props: {
  loading: boolean;
  items: Array<{ id: string; type: string; title: string; body: string; read: boolean; created_at: string; visitId: string | null }>;
  markRead: ReturnType<typeof useMarkNotificationRead>;
}) {
  const { loading, items, markRead } = props;

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
        <div className="py-10 text-center text-sm text-muted-foreground">No notifications</div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-lg">
      <div className="divide-y divide-border">
        {items.map((n) => (
          <div key={n.id} className="px-4 py-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                {!n.read && <Badge variant="primary" size="sm">New</Badge>}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{new Date(n.created_at).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{n.body}</p>
              {n.visitId && (
                <div className="mt-2">
                  <Link href={`/visitors/${encodeURIComponent(n.visitId)}`} className="text-sm font-medium text-primary hover:underline">
                    Open visit →
                  </Link>
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
        ))}
      </div>
    </Card>
  );
}

