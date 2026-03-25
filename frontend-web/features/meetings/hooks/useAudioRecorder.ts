"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseAudioRecorderReturn {
  isRecording: boolean;
  duration: number; // seconds
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resolveStopRef = useRef<((blob: Blob | null) => void) | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    chunksRef.current = [];
    setDuration(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "";

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        // Stop all mic tracks
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        // Clear timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setIsRecording(false);
        // Resolve the promise from stopRecording
        if (resolveStopRef.current) {
          resolveStopRef.current(blob);
          resolveStopRef.current = null;
        }
      };

      recorder.start(1000); // collect data every second
      setIsRecording(true);

      // Start duration timer
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Microphone access denied";
      setError(message);
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
        resolve(null);
        return;
      }
      resolveStopRef.current = resolve;
      mediaRecorderRef.current.stop();
    });
  }, []);

  return { isRecording, duration, error, startRecording, stopRecording };
}
