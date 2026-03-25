export interface MeetingTranscript {
  id: string;
  meeting_id: string;
  content: string | null;
  audio_file_key: string | null;
  transcription_status: "completed" | "transcribing" | "failed";
  created_at: string;
}

export interface Meeting {
  id: string;
  society_id: string;
  created_by: string;
  title: string;
  agenda: string | null;
  scheduled_at: string | null;
  summary: string | null;
  description: string | null;
  action_items: string[] | null;
  key_decisions: string[] | null;
  created_at: string;
  transcripts: MeetingTranscript[];
}

export interface MeetingListItem {
  id: string;
  title: string;
  agenda: string | null;
  scheduled_at: string | null;
  summary: string | null;
  created_at: string;
  transcript_count: number;
}

export interface MeetingCreateInput {
  title: string;
  agenda?: string;
  scheduled_at?: string;
}

export interface TranscriptCreateInput {
  content: string;
}

export interface SummaryResponse {
  meeting_id: string;
  summary: string;
  action_items: string[];
  key_decisions: string[];
  description: string;
}

export interface QueryResponse {
  answer: string;
  source_meeting_ids: string[];
}

export interface TranscriptAddResponse {
  status: string;
  transcript_id: string;
}
