/**
 * API client configuration for backend communication.
 * Supports both httpOnly cookie auth and Bearer token fallback.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status?: number;
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  timeout?: number;
  retries?: number;
}

class ApiClient {
  private baseURL: string;
  private defaultTimeout: number = 30000;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(typeof options.headers === "object" && !(options.headers instanceof Headers)
        ? (options.headers as Record<string, string>)
        : {}),
    };

    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
        credentials: "include",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 401) {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("vms_user");
          localStorage.removeItem("access_token");
        }
        return { 
          error: "Session expired. Please login again.",
          status: 401,
        };
      }

      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        return { 
          error: `Rate limit exceeded. Please wait ${retryAfter || "a moment"} and try again.`,
          status: 429,
        };
      }

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        const msg = err.detail || err.message || "Request failed";
        return { 
          error: typeof msg === "string" ? msg : JSON.stringify(msg),
          status: response.status,
        };
      }

      if (response.status === 204) {
        return { data: undefined as T };
      }

      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          return { error: "Request timeout. Please try again." };
        }
        return { error: error.message };
      }
      return { error: "Network error" };
    }
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

/**
 * Download a blob from an API path (e.g. /dashboard/muster?format=csv).
 * Uses same origin credentials and Bearer token. Returns true if successful.
 */
export async function downloadBlob(
  path: string,
  filename: string
): Promise<boolean> {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const res = await fetch(`${API_BASE_URL}${path}`, {
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) return false;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  } catch {
    return false;
  }
}

// ---------- Societies (public: by-slug for signup; auth: list/create for super_admin) ----------

export interface SocietyBySlug {
  id: string;
  slug: string;
  name: string;
  buildings?: { id: string; code: string | null; name: string }[];
}

/** Public: get society by slug (e.g. for signup). Optionally include buildings. */
export async function getSocietyBySlug(
  slug: string,
  includeBuildings = false
): Promise<SocietyBySlug | null> {
  try {
    const url = `${API_BASE_URL}/societies/by-slug/${encodeURIComponent(slug)}${includeBuildings ? "?include_buildings=true" : ""}`;
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) return null;
    return (await res.json()) as SocietyBySlug;
  } catch {
    return null;
  }
}

export interface SocietyListItem {
  id: string;
  slug: string;
  name: string;
  address: string | null;
  city: string | null;
  contact_email: string;
  plan: string;
  status: string;
  is_active: boolean;
}

/** List societies. Super admin only. */
export async function listSocieties(q?: string): Promise<SocietyListItem[]> {
  const params = new URLSearchParams();
  if (q?.trim()) params.set("q", q.trim());
  const path = "/societies/" + (params.toString() ? "?" + params.toString() : "");
  const res = await apiClient.get<SocietyListItem[]>(path);
  if (res.error || !res.data) return [];
  return Array.isArray(res.data) ? res.data : [];
}

/** Create society. Super admin only. */
export async function createSociety(body: {
  name: string;
  slug: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  contact_email: string;
  contact_phone?: string;
  plan?: string;
  status?: string;
}): Promise<SocietyListItem | null> {
  const res = await apiClient.post<SocietyListItem>("/societies/", body);
  if (res.error || !res.data) return null;
  return res.data;
}

// ---------- Buildings ----------

export interface BuildingListItem {
  id: string;
  society_id: string;
  code: string | null;
  name: string;
  sort_order: number | null;
  is_active: boolean;
}

/** List buildings for a society. Authenticated. */
export async function listBuildings(societyId: string): Promise<BuildingListItem[]> {
  const res = await apiClient.get<BuildingListItem[]>(`/buildings/?society_id=${encodeURIComponent(societyId)}`);
  if (res.error || !res.data) return [];
  return Array.isArray(res.data) ? res.data : [];
}

/** Create building. Admin of society or super_admin. */
export async function createBuilding(body: {
  society_id: string;
  name: string;
  code?: string;
  sort_order?: number;
}): Promise<BuildingListItem | null> {
  const res = await apiClient.post<BuildingListItem>("/buildings/", body);
  if (res.error || !res.data) return null;
  return res.data;
}

/** User list item (society users). */
export interface UserListItem {
  id: string;
  email: string;
  full_name: string;
  username: string;
  role: string;
  phone: string | null;
  flat_number: string | null;
  is_active: boolean;
  created_at: string | null;
  last_login: string | null;
}

/** List users in current user's society. Admin only. */
export async function listUsers(role?: string): Promise<UserListItem[]> {
  const q = role ? `?role=${encodeURIComponent(role)}` : "";
  const res = await apiClient.get<UserListItem[]>(`/users${q}`);
  if (res.error || !res.data) return [];
  return Array.isArray(res.data) ? res.data : [];
}

/** Create user in current user's society (admin, guard, or resident). Admin only. */
export async function createUser(body: {
  email: string;
  full_name: string;
  role: string;
  password: string;
  phone?: string;
  flat_number?: string;
}): Promise<{ user: UserListItem | null; error?: string }> {
  const res = await apiClient.post<UserListItem>("/users/", body);
  if (res.error) return { user: null, error: res.error };
  return { user: res.data ?? null };
}
