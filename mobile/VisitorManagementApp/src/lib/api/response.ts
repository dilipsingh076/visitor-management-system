export function asArray<T>(data: unknown, fallbackKey = 'items'): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const list = obj[fallbackKey];
    if (Array.isArray(list)) return list as T[];
    const visits = obj.visits;
    if (Array.isArray(visits)) return visits as T[];
  }
  return [];
}

export function toErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (typeof err === 'string' && err.trim()) return err;
  if (err && typeof err === 'object' && 'message' in err) {
    const value = (err as {message?: unknown}).message;
    if (typeof value === 'string' && value.trim()) return value;
  }
  return fallback;
}
