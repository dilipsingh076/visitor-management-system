"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * Common hook: debounce a value. Useful for search inputs, filters.
 */
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}

/**
 * Common hook: debounced callback. Returns a stable function that debounces invocations.
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => void>(
  fn: T,
  delayMs: number
): T {
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

  const debounced = useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutId) clearTimeout(timeoutId);
      const id = setTimeout(() => {
        fn(...args);
        setTimeoutId(null);
      }, delayMs);
      setTimeoutId(id);
    }) as T,
    [fn, delayMs, timeoutId]
  );

  useEffect(() => () => { if (timeoutId) clearTimeout(timeoutId); }, [timeoutId]);

  return debounced;
}
