/**
 * API configuration for mobile app with secure token storage.
 */
import { Platform } from 'react-native';
import { getSecureToken, getRefreshToken, setSecureToken, setRefreshToken, clearAllAuthData } from '../lib/secureStorage';

function getDevServerHost(): string | null {
  // When running on a physical device, localhost points to the phone itself.
  // Metro's scriptURL contains the host where the JS bundle is served from.
  try {
    // Lazy import to avoid issues in non-RN environments.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { NativeModules } = require('react-native');
    const scriptURL: string | undefined = NativeModules?.SourceCode?.scriptURL;
    if (!scriptURL) return null;
    const host = new URL(scriptURL).hostname;
    if (!host) return null;

    // Normalize common loopback forms so generated URLs remain valid.
    if (host === '::1' || host === '[::1]' || host === 'localhost') {
      return '127.0.0.1';
    }
    if (host === '0.0.0.0') {
      return '127.0.0.1';
    }
    return host;
  } catch {
    return null;
  }
}

function getBaseUrl() {
  if (__DEV__) {
    // Prefer localhost in Android dev with `adb reverse tcp:8003 tcp:8003`.
    // This is more stable than emulator host aliases across environments.
    if (Platform.OS === 'android') {
      return 'http://localhost:8003/api/v1';
    }
    // iOS simulator & web can hit localhost directly.
    // Prefer Metro host IP so it works on physical iPhones too.
    const host = getDevServerHost() || '127.0.0.1';
    return `http://${host}:8003/api/v1`;
  }
  return 'https://your-api-domain.com/api/v1';
}

const API_BASE_URL = getBaseUrl();

const REQUEST_TIMEOUT = 30000;

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status?: number;
}

type JsonObject = Record<string, unknown>;

class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string, timeout: number = REQUEST_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    timeoutOverrideMs?: number,
  ): Promise<ApiResponse<T>> {
    const effectiveTimeout =
      typeof timeoutOverrideMs === 'number' && timeoutOverrideMs > 0
        ? timeoutOverrideMs
        : this.timeout;
    const token = await getSecureToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (options.headers && typeof options.headers === 'object') {
      Object.assign(headers, options.headers as Record<string, string>);
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      let response = await Promise.race<Response>([
        fetch(`${this.baseURL}${endpoint}`, {
          ...options,
          headers,
        }),
        new Promise<Response>((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout. Please try again.')), effectiveTimeout);
        }),
      ]);

      if (response.status === 401) {
        // Try refresh token once
        const refreshToken = await getRefreshToken();
        let refreshed = false;
        if (refreshToken) {
          try {
            const refreshRes = await fetch(`${this.baseURL}/auth/refresh`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refresh_token: refreshToken }),
            });
            if (refreshRes.ok) {
              const data = (await refreshRes.json().catch(() => ({}))) as JsonObject;
              const newAccess = typeof data.access_token === 'string' ? data.access_token : undefined;
              const newRefresh = typeof data.refresh_token === 'string' ? data.refresh_token : undefined;
              if (newAccess) {
                await setSecureToken(newAccess);
                headers.Authorization = `Bearer ${newAccess}`;
              }
              if (newRefresh) {
                await setRefreshToken(newRefresh);
              }
              refreshed = Boolean(newAccess);
              if (refreshed) {
                response = await Promise.race<Response>([
                  fetch(`${this.baseURL}${endpoint}`, {
                    ...options,
                    headers,
                  }),
                  new Promise<Response>((_, reject) => {
                    setTimeout(() => reject(new Error('Request timeout. Please try again.')), effectiveTimeout);
                  }),
                ]);
              }
            }
          } catch {
            refreshed = false;
          }
        }
        if (!refreshed || response.status === 401) {
          await clearAllAuthData();
          return {
            error: 'Session expired. Please login again.',
            status: 401,
          };
        }
      }

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        return {
          error: `Rate limit exceeded. Please wait ${retryAfter || 'a moment'}.`,
          status: 429,
        };
      }

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({
          message: 'Request failed',
        }))) as JsonObject;
        const detail = typeof errorData.detail === 'string' ? errorData.detail : undefined;
        const message = typeof errorData.message === 'string' ? errorData.message : undefined;
        return {
          error: detail || message || `HTTP ${response.status}`,
          status: response.status,
        };
      }

      if (response.status === 204) {
        return { data: undefined as T, status: 204 };
      }

      const data = (await response.json()) as T;
      return { data, status: response.status };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.message.toLowerCase().includes('timeout')) {
          return { error: 'Request timeout. Please try again.' };
        }
        if (__DEV__) {
          return { error: `${error.message} (url: ${this.baseURL}${endpoint})` };
        }
        return { error: error.message };
      }
      return { error: 'Network error' };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    timeoutOverrideMs?: number,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: body !== undefined ? JSON.stringify(body) : undefined,
      },
      timeoutOverrideMs,
    );
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
