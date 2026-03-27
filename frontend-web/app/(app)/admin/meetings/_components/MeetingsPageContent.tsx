"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth";
import { useMeetingsList, useCreateMeeting, useQueryMeetings } from "@/features/meetings";
import { Button, Card, CardContent, CardHeader, PageHeader } from "@/components/ui";
import { PageWrapper } from "@/components/common/PageWrapper";
import { theme } from "@/lib/theme";
import {
  Plus,
  FileText,
  Brain,
  Calendar,
  MessageSquare,
  Search,
  Loader2,
  Send,
  X,
} from "lucide-react";
import type { MeetingListItem, QueryResponse } from "@/features/meetings";

export function MeetingsPageContent() {
  const { user, loading: authLoading } = useAuth({ requireAuth: true });

  const meetingsQ = useMeetingsList({ enabled: !!user });
  const createMeeting = useCreateMeeting();
  const queryMeetings = useQueryMeetings();

  const meetings = meetingsQ.data;
  const loading = authLoading || meetingsQ.isLoading;

  const [showCreate, setShowCreate] = useState(false);
  const [showQuery, setShowQuery] = useState(false);
  const [title, setTitle] = useState("");
  const [agenda, setAgenda] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [question, setQuestion] = useState("");
  const [queryResult, setQueryResult] = useState<QueryResponse | null>(null);

  const handleCreate = async () => {
    if (!title.trim()) return;
    await createMeeting.mutateAsync({
      title: title.trim(),
      agenda: agenda.trim() || undefined,
      scheduled_at: scheduledAt || undefined,
    });
    setTitle("");
    setAgenda("");
    setScheduledAt("");
    setShowCreate(false);
  };

  const handleQuery = async () => {
    if (!question.trim()) return;
    const result = await queryMeetings.mutateAsync(question.trim());
    setQueryResult(result);
  };

  if (loading) {
    return (
      <PageWrapper width="wide">
        <div className={theme.loading.page}>
          <div className={theme.loading.line} />
          <div className={theme.loading.card} />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper width="wide">
      <div className="space-y-6">
        <PageHeader
          title="Meeting Details"
          description="Create meetings, add transcripts, and generate AI summaries"
          action={
            <Button onClick={() => setShowCreate(!showCreate)}>
              <Plus className="w-4 h-4 mr-1.5" />
              New Meeting
            </Button>
          }
        />

        {/* Create Meeting Form */}
        {showCreate && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Create New Meeting</h3>
                <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className={theme.label}>Title *</label>
                  <input
                    type="text"
                    placeholder="Meeting title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={theme.input.base}
                  />
                </div>
                <div>
                  <label className={theme.label}>Agenda</label>
                  <textarea
                    placeholder="Meeting agenda (optional)"
                    value={agenda}
                    onChange={(e) => setAgenda(e.target.value)}
                    rows={3}
                    className={`${theme.input.base} resize-none`}
                  />
                </div>
                <div>
                  <label className={theme.label}>Scheduled At</label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className={theme.input.base}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreate(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={createMeeting.isPending || !title.trim()}
                  >
                    {createMeeting.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    ) : (
                      <Plus className="w-4 h-4 mr-1.5" />
                    )}
                    Create
                  </Button>
                </div>
                {createMeeting.isError && (
                  <p className="text-sm text-error">
                    {createMeeting.error?.message || "Failed to create meeting"}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Meetings List */}
        {!meetings || meetings.length === 0 ? (
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No meetings yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first meeting to get started with AI-powered summaries.
                </p>
                <Button onClick={() => setShowCreate(true)}>
                  <Plus className="w-4 h-4 mr-1.5" />
                  Create Meeting
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {meetings.map((meeting: MeetingListItem) => (
              <Link key={meeting.id} href={`/admin/meetings/${meeting.id}`}>
                <Card className="hover:border-primary/30 transition-colors cursor-pointer">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground truncate">
                            {meeting.title}
                          </h3>
                          {meeting.summary && (
                            <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-success-light text-success rounded-full">
                              <Brain className="w-3 h-3" />
                              Summarized
                            </span>
                          )}
                        </div>
                        {meeting.agenda && (
                          <p className="text-sm text-muted-foreground line-clamp-1 mb-1">
                            {meeting.agenda}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(meeting.created_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {meeting.transcript_count} transcript{meeting.transcript_count !== 1 ? "s" : ""}
                          </span>
                          {meeting.scheduled_at && (
                            <span className="flex items-center gap-1">
                              Scheduled: {new Date(meeting.scheduled_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Floating Ask AI */}
      <div className="fixed bottom-6 right-6 z-40">
        {showQuery ? (
          <div className="w-96 bg-card border border-border rounded-xl shadow-dropdown dropdown-enter overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Ask AI</span>
              </div>
              <button onClick={() => { setShowQuery(false); setQueryResult(null); }} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
              <p className="text-xs text-muted-foreground">
                Ask questions across all your meeting transcripts.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. What decisions were made about parking?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleQuery()}
                  className={`flex-1 ${theme.input.base}`}
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={handleQuery}
                  disabled={queryMeetings.isPending || !question.trim()}
                >
                  {queryMeetings.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {queryResult && (
                <div className="p-3 bg-muted-bg rounded-lg border border-border">
                  <p className="text-xs font-medium text-foreground mb-1">AI Answer:</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{queryResult.answer}</p>
                  {queryResult.source_meeting_ids.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Sources: {queryResult.source_meeting_ids.length} meeting(s)
                    </p>
                  )}
                </div>
              )}
              {queryMeetings.isError && (
                <p className="text-xs text-error">
                  {queryMeetings.error?.message || "Query failed. Make sure Ollama is running."}
                </p>
              )}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowQuery(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary text-white font-medium shadow-lg hover:bg-primary-hover transition-all hover:-translate-y-0.5"
          >
            <Brain className="w-5 h-5" />
            Ask AI
          </button>
        )}
      </div>
    </PageWrapper>
  );
}
