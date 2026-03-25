"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { API } from "@/lib/api/endpoints";
import type {
  Meeting,
  MeetingListItem,
  MeetingCreateInput,
  TranscriptCreateInput,
  TranscriptAddResponse,
  SummaryResponse,
  QueryResponse,
} from "../types";

export const meetingsKeys = {
  all: ["meetings"] as const,
  list: (filters: Record<string, unknown>) =>
    [...meetingsKeys.all, "list", filters] as const,
  detail: (id: string) => [...meetingsKeys.all, "detail", id] as const,
};

interface UseMeetingsListParams {
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

export function useMeetingsList(params: UseMeetingsListParams = {}) {
  const { enabled = true, ...filters } = params;
  return useQuery({
    queryKey: meetingsKeys.list(filters),
    queryFn: async (): Promise<MeetingListItem[]> => {
      const queryParams = new URLSearchParams();
      if (filters.limit) queryParams.set("limit", String(filters.limit));
      if (filters.offset) queryParams.set("offset", String(filters.offset));
      const url = `${API.meetings.list}?${queryParams.toString()}`;
      const res = await apiClient.get<MeetingListItem[]>(url);
      return res.data ?? [];
    },
    enabled,
  });
}

export function useMeeting(id: string | null | undefined) {
  return useQuery({
    queryKey: meetingsKeys.detail(id ?? ""),
    queryFn: async (): Promise<Meeting> => {
      const res = await apiClient.get<Meeting>(API.meetings.get(id!));
      if (!res.data) throw new Error("Meeting not found");
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: MeetingCreateInput): Promise<Meeting> => {
      const res = await apiClient.post<Meeting>(API.meetings.create, input);
      if (!res.data) throw new Error(res.error || "Failed to create meeting");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingsKeys.all });
    },
  });
}

export function useAddTranscript() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      meetingId,
      data,
    }: {
      meetingId: string;
      data: TranscriptCreateInput;
    }): Promise<TranscriptAddResponse> => {
      const res = await apiClient.post<TranscriptAddResponse>(
        API.meetings.addTranscript(meetingId),
        data
      );
      if (!res.data) throw new Error(res.error || "Failed to add transcript");
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: meetingsKeys.detail(variables.meetingId),
      });
      queryClient.invalidateQueries({ queryKey: meetingsKeys.all });
    },
  });
}

export function useSummarizeMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (meetingId: string): Promise<SummaryResponse> => {
      const res = await apiClient.post<SummaryResponse>(
        API.meetings.summarize(meetingId)
      );
      if (!res.data) throw new Error(res.error || "Failed to generate summary");
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: meetingsKeys.detail(data.meeting_id),
      });
      queryClient.invalidateQueries({ queryKey: meetingsKeys.all });
    },
  });
}

export function useQueryMeetings() {
  return useMutation({
    mutationFn: async (question: string): Promise<QueryResponse> => {
      const res = await apiClient.post<QueryResponse>(API.meetings.query, {
        question,
      });
      if (!res.data) throw new Error(res.error || "Failed to query meetings");
      return res.data;
    },
  });
}

export function useUploadAudio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      meetingId,
      audioBlob,
    }: {
      meetingId: string;
      audioBlob: Blob;
    }): Promise<TranscriptAddResponse> => {
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("access_token")
          : null;

      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

      const res = await fetch(
        `${API_BASE_URL}${API.meetings.uploadAudio(meetingId)}`,
        {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
          body: formData,
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to upload audio");
      }

      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: meetingsKeys.detail(variables.meetingId),
      });
      queryClient.invalidateQueries({ queryKey: meetingsKeys.all });
    },
  });
}

export function useDeleteMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (meetingId: string): Promise<void> => {
      const res = await apiClient.delete(API.meetings.delete(meetingId));
      if (res.error) throw new Error(res.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingsKeys.all });
    },
  });
}
