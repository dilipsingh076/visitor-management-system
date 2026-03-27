"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth";
import {
  useMeeting,
  useAddTranscript,
  useSummarizeMeeting,
  useDeleteMeeting,
  useQueryMeetings,
  useUploadAudio,
  useAudioRecorder,
} from "@/features/meetings";
import { Button, Card, CardContent, CardHeader, PageHeader } from "@/components/ui";
import { PageWrapper } from "@/components/common/PageWrapper";
import { theme } from "@/lib/theme";
import {
  ArrowLeft,
  Plus,
  Brain,
  FileText,
  Calendar,
  Loader2,
  Trash2,
  CheckCircle,
  ListChecks,
  Send,
  X,
  ClipboardList,
  Mic,
  Square,
  AlertCircle,
} from "lucide-react";
import type { MeetingTranscript, QueryResponse } from "@/features/meetings";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function TranscriptStatusBadge({ transcript }: { transcript: MeetingTranscript }) {
  if (transcript.transcription_status === "transcribing") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-warning bg-warning-light px-2 py-0.5 rounded-full">
        <Loader2 className="w-3 h-3 animate-spin" />
        Transcribing...
      </span>
    );
  }
  if (transcript.transcription_status === "failed") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
        <AlertCircle className="w-3 h-3" />
        Failed
      </span>
    );
  }
  if (transcript.audio_file_key) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
        <Mic className="w-3 h-3" />
        Audio
      </span>
    );
  }
  return null;
}

interface Props {
  meetingId: string;
}

export function MeetingDetailContent({ meetingId }: Props) {
  const router = useRouter();
  const { loading: authLoading } = useAuth({ requireAuth: true });
  const { data: meeting, isLoading } = useMeeting(meetingId);
  const addTranscript = useAddTranscript();
  const summarize = useSummarizeMeeting();
  const deleteMeeting = useDeleteMeeting();
  const queryMeetings = useQueryMeetings();
  const uploadAudio = useUploadAudio();
  const recorder = useAudioRecorder();

  const [showTranscriptForm, setShowTranscriptForm] = useState(false);
  const [transcriptContent, setTranscriptContent] = useState("");
  const [question, setQuestion] = useState("");
  const [queryResult, setQueryResult] = useState<QueryResponse | null>(null);

  // Auto-refetch while any transcript is transcribing
  const hasTranscribing = meeting?.transcripts.some(
    (t) => t.transcription_status === "transcribing"
  );
  const { refetch } = useMeeting(meetingId);
  useEffect(() => {
    if (!hasTranscribing) return;
    const interval = setInterval(() => refetch(), 5000);
    return () => clearInterval(interval);
  }, [hasTranscribing, refetch]);

  if (authLoading || isLoading) {
    return (
      <PageWrapper width="wide">
        <div className={theme.loading.page}>
          <div className={theme.loading.line} />
        </div>
      </PageWrapper>
    );
  }

  if (!meeting) {
    return (
      <PageWrapper width="wide">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Meeting not found</p>
          <Link href="/admin/meetings" className="text-primary text-sm mt-2 inline-block">
            Back to meetings
          </Link>
        </div>
      </PageWrapper>
    );
  }

  const handleAddTranscript = async () => {
    if (!transcriptContent.trim()) return;
    await addTranscript.mutateAsync({
      meetingId,
      data: { content: transcriptContent.trim() },
    });
    setTranscriptContent("");
    setShowTranscriptForm(false);
  };

  const handleSummarize = async () => {
    await summarize.mutateAsync(meetingId);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this meeting?")) return;
    await deleteMeeting.mutateAsync(meetingId);
    router.push("/admin/meetings");
  };

  const handleQuery = async () => {
    if (!question.trim()) return;
    const result = await queryMeetings.mutateAsync(question.trim());
    setQueryResult(result);
  };

  const handleStopAndUpload = async () => {
    const blob = await recorder.stopRecording();
    if (blob) {
      await uploadAudio.mutateAsync({ meetingId, audioBlob: blob });
    }
  };

  return (
    <PageWrapper width="wide">
      <div className="space-y-6">
        {/* Back + Header */}
        <div>
          <Link
            href="/admin/meetings"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to meetings
          </Link>
          <PageHeader
            title={meeting.title}
            description={meeting.agenda?.trim() ? meeting.agenda : undefined}
            action={
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={deleteMeeting.isPending}
                className="text-error hover:text-error"
              >
                {deleteMeeting.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            }
          />
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-1 mb-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Created {new Date(meeting.created_at).toLocaleDateString()}
            </span>
            {meeting.scheduled_at && (
              <span>Scheduled: {new Date(meeting.scheduled_at).toLocaleDateString()}</span>
            )}
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {meeting.transcripts.length} transcript{meeting.transcripts.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* AI Summary Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">AI Summary</h2>
              </div>
              <Button
                onClick={handleSummarize}
                disabled={summarize.isPending || meeting.transcripts.length === 0}
                size="sm"
              >
                {summarize.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-1.5" />
                    {meeting.summary ? "Regenerate" : "Generate"} Summary
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {meeting.summary ? (
              <div className="space-y-4">
                {/* Summary */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Summary</h3>
                  <p className="text-sm">{meeting.summary}</p>
                </div>

                {/* Description */}
                {meeting.description && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                    <p className="text-sm">{meeting.description}</p>
                  </div>
                )}

                {/* Action Items */}
                {meeting.action_items && meeting.action_items.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <ListChecks className="w-4 h-4" />
                      Action Items
                    </h3>
                    <ul className="space-y-1">
                      {meeting.action_items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Key Decisions */}
                {meeting.key_decisions && meeting.key_decisions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <ClipboardList className="w-4 h-4" />
                      Key Decisions
                    </h3>
                    <ul className="space-y-1">
                      {meeting.key_decisions.map((decision, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="w-5 h-5 shrink-0 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium mt-0.5">
                            {i + 1}
                          </span>
                          <span>{decision}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {meeting.transcripts.length === 0
                  ? "Add transcripts first, then generate an AI summary."
                  : "Click \"Generate Summary\" to create an AI-powered summary with action items and key decisions."}
              </p>
            )}
            {summarize.isError && (
              <p className="text-sm text-error mt-2">
                {summarize.error?.message || "Summary generation failed. Make sure Ollama is running."}
              </p>
            )}
          </CardContent>
        </Card>

        {/* AI Query Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Ask AI About Meetings</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask a question about your meetings..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleQuery()}
                className="flex-1 px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Button
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
              <div className="mt-4 p-4 bg-muted-bg rounded-lg">
                <p className="text-sm font-medium mb-1">AI Answer:</p>
                <p className="text-sm whitespace-pre-wrap">{queryResult.answer}</p>
                {queryResult.source_meeting_ids.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Sources: {queryResult.source_meeting_ids.length} meeting(s)
                  </p>
                )}
              </div>
            )}
            {queryMeetings.isError && (
              <p className="text-sm text-error mt-2">
                {queryMeetings.error?.message || "Query failed. Make sure Ollama is running."}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Transcripts Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">Transcripts</h2>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => recorder.isRecording ? handleStopAndUpload() : recorder.startRecording()}
                  disabled={uploadAudio.isPending}
                >
                  {uploadAudio.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                      Uploading...
                    </>
                  ) : recorder.isRecording ? (
                    <>
                      <Square className="w-4 h-4 mr-1.5 text-red-500" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-1.5" />
                      Record Audio
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowTranscriptForm(!showTranscriptForm)}
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Transcript
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Recording Indicator */}
            {recorder.isRecording && (
              <div className="mb-4 p-4 border border-red-200 rounded-lg bg-red-50/50 flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                </span>
                <span className="text-sm font-medium">Recording</span>
                <span className="text-sm font-mono text-muted-foreground">
                  {formatDuration(recorder.duration)}
                </span>
              </div>
            )}

            {/* Recorder / Upload Errors */}
            {recorder.error && (
              <p className="text-sm text-error mb-4">{recorder.error}</p>
            )}
            {uploadAudio.isError && (
              <p className="text-sm text-error mb-4">
                {uploadAudio.error?.message || "Failed to upload audio"}
              </p>
            )}

            {/* Add Transcript Form */}
            {showTranscriptForm && (
              <div className="mb-4 p-4 border border-border rounded-lg bg-muted-bg/50">
                <label className="block text-sm font-medium mb-2">Transcript Content</label>
                <textarea
                  placeholder="Paste or type meeting transcript here..."
                  value={transcriptContent}
                  onChange={(e) => setTranscriptContent(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowTranscriptForm(false);
                      setTranscriptContent("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAddTranscript}
                    disabled={addTranscript.isPending || !transcriptContent.trim()}
                  >
                    {addTranscript.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    ) : (
                      <Plus className="w-4 h-4 mr-1.5" />
                    )}
                    Add
                  </Button>
                </div>
                {addTranscript.isError && (
                  <p className="text-sm text-error mt-2">
                    {addTranscript.error?.message || "Failed to add transcript"}
                  </p>
                )}
              </div>
            )}

            {/* Transcript List */}
            {meeting.transcripts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No transcripts yet.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add meeting transcripts to enable AI summaries and queries.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {meeting.transcripts.map((transcript: MeetingTranscript, index: number) => (
                  <div
                    key={transcript.id}
                    className="p-3 border border-border rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          Transcript #{index + 1}
                        </span>
                        <TranscriptStatusBadge transcript={transcript} />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(transcript.created_at).toLocaleString()}
                      </span>
                    </div>
                    {/* Audio Player */}
                    {transcript.audio_file_key && (
                      <div className="mb-2">
                        <audio
                          controls
                          preload="none"
                          className="w-full h-8"
                          src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/meetings/${meetingId}/audio/${transcript.id}?token=${typeof window !== "undefined" ? localStorage.getItem("access_token") || "" : ""}`}
                        />
                      </div>
                    )}
                    {transcript.transcription_status === "transcribing" ? (
                      <p className="text-sm text-muted-foreground italic">
                        Transcribing and processing audio. This may take a few minutes...
                      </p>
                    ) : transcript.content ? (
                      <p className="text-sm whitespace-pre-wrap line-clamp-6">
                        {transcript.content}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No transcript content available.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
