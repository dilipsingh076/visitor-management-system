/**
 * Authentication module with secure token storage.
 */
import {
  setSecureToken,
  getSecureToken,
  removeSecureToken,
  setUserData,
  getUserData,
  clearAllAuthData,
  setRefreshToken,
  removeRefreshToken,
} from '../lib/secureStorage';
import { API_BASE_URL, apiClient } from './api';

const KEYCLOAK_URL = __DEV__
  ? 'http://10.0.2.2:8080'
  : 'https://your-keycloak-domain.com';
const KEYCLOAK_REALM = 'vms';
const KEYCLOAK_CLIENT_ID = 'vms-mobile';

export interface SocietySummary {
  id: string;
  slug: string;
  name: string;
}

export interface User {
  id: string;
  user_id?: string;
  email: string;
  roles: string[];
  role?: string;
  username: string;
  society?: SocietySummary;
  society_id?: string;
  flat_number?: string;
}

function apiErrorDetail(body: unknown): string | undefined {
  if (body && typeof body === 'object' && 'detail' in body) {
    const v = (body as { detail: unknown }).detail;
    if (typeof v === 'string') return v;
  }
  return undefined;
}

function societyFromJson(v: unknown): SocietySummary | undefined {
  if (v === null || typeof v !== 'object') return undefined;
  const o = v as Record<string, unknown>;
  if (
    typeof o.id !== 'string' ||
    typeof o.slug !== 'string' ||
    typeof o.name !== 'string'
  ) {
    return undefined;
  }
  return { id: o.id, slug: o.slug, name: o.name };
}

function userFromAuthJson(v: unknown): User | undefined {
  if (v === null || typeof v !== 'object') return undefined;
  const o = v as Record<string, unknown>;
  if (
    typeof o.id !== 'string' ||
    typeof o.email !== 'string' ||
    (typeof o.username !== 'string' && typeof o.full_name !== 'string')
  ) {
    return undefined;
  }
  const roles = Array.isArray(o.roles)
    ? o.roles.filter((r): r is string => typeof r === 'string')
    : [];
  const username =
    typeof o.username === 'string'
      ? o.username
      : (o.full_name as string);
  return {
    id: o.id,
    user_id: typeof o.user_id === 'string' ? o.user_id : undefined,
    email: o.email,
    username,
    roles,
    role: typeof o.role === 'string' ? o.role : undefined,
    society: societyFromJson(o.society),
    society_id:
      typeof o.society_id === 'string' ? o.society_id : undefined,
    flat_number:
      typeof o.flat_number === 'string' ? o.flat_number : undefined,
  };
}

/** Normalize `/auth/me` or login `user` payloads into `User`. */
export function normalizeUserPayload(raw: unknown): User | null {
  const u = userFromAuthJson(raw);
  if (u) return u;
  if (raw === null || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const id =
    typeof o.id === 'string'
      ? o.id
      : typeof o.user_id === 'string'
        ? o.user_id
        : null;
  const email = typeof o.email === 'string' ? o.email : null;
  const username =
    typeof o.username === 'string'
      ? o.username
      : typeof o.preferred_username === 'string'
        ? o.preferred_username
        : typeof o.full_name === 'string'
          ? o.full_name
          : null;
  if (!id || !email || !username) return null;
  const roles = Array.isArray(o.roles)
    ? o.roles.filter((r): r is string => typeof r === 'string')
    : [];
  return {
    id,
    user_id: typeof o.user_id === 'string' ? o.user_id : undefined,
    email,
    username,
    roles,
    role: typeof o.role === 'string' ? o.role : undefined,
    society: societyFromJson(o.society),
    society_id:
      typeof o.society_id === 'string' ? o.society_id : undefined,
    flat_number:
      typeof o.flat_number === 'string' ? o.flat_number : undefined,
  };
}

function parseAuthSuccess(raw: unknown): {
  access_token?: string;
  refresh_token?: string;
  user?: User;
} | null {
  if (raw === null || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  return {
    access_token:
      typeof o.access_token === 'string' ? o.access_token : undefined,
    refresh_token:
      typeof o.refresh_token === 'string' ? o.refresh_token : undefined,
    user: userFromAuthJson(o.user),
  };
}

export const authConfig = {
  keycloakUrl: KEYCLOAK_URL,
  realm: KEYCLOAK_REALM,
  clientId: KEYCLOAK_CLIENT_ID,
  useDemoAuth: false,
};

export const ROLE_LABELS: Record<string, string> = {
  guard: 'Guard',
  resident: 'Resident',
};

/** Matches backend `require_committee` / society-admin style roles. */
const COMMITTEE_ROLES = new Set([
  'chairman',
  'secretary',
  'treasurer',
  'platform_admin',
  'admin',
  'committee',
]);

const RESIDENT_LIKE_ROLES = new Set([
  'resident',
  'chairman',
  'secretary',
  'treasurer',
  'platform_admin',
  'admin',
  'committee',
]);

function normRole(r: string): string {
  return String(r || '')
    .toLowerCase()
    .trim();
}

/** All roles from JWT/cache, lowercased (avoids `user.role: "Chairman"` breaking navigation). */
export function getNormalizedRoleSet(user: User | null): Set<string> {
  if (!user) return new Set();
  const fromList = (user.roles || []).map(normRole).filter(Boolean);
  const fromField = user.role ? [normRole(user.role)] : [];
  return new Set([...fromList, ...fromField]);
}

export function getPrimaryRole(user: User | null): string {
  if (!user) return 'resident';
  const roleSet = getNormalizedRoleSet(user);
  if (roleSet.has('platform_admin')) return 'platform_admin';
  if (roleSet.has('guard')) return 'guard';
  for (const r of roleSet) {
    if (RESIDENT_LIKE_ROLES.has(r)) return 'resident';
  }
  const first = [...roleSet][0];
  return first || 'resident';
}

/** Web `canAccessPlatform`: platform operators only. */
export function canAccessPlatform(user: User | null): boolean {
  return Boolean(user && getNormalizedRoleSet(user).has('platform_admin'));
}

/** Chairman / secretary / treasurer only (matches web `isCommittee` / society admin for guard tools). */
function hasSocietyCommitteeRole(user: User | null): boolean {
  if (!user) return false;
  const set = getNormalizedRoleSet(user);
  return (
    set.has('chairman') ||
    set.has('secretary') ||
    set.has('treasurer')
  );
}

export function canInviteVisitor(user: User | null): boolean {
  if (!user) return false;
  if (getNormalizedRoleSet(user).has('platform_admin')) return false;
  if (getNormalizedRoleSet(user).has('guard')) return false;
  return (
    getNormalizedRoleSet(user).has('resident') || hasSocietyCommitteeRole(user)
  );
}

export function canAccessGuardFeatures(user: User | null): boolean {
  const role = getPrimaryRole(user);
  return role === 'guard';
}

export function canAccessCommitteeFeatures(user: User | null): boolean {
  if (!user) return false;
  for (const r of getNormalizedRoleSet(user)) {
    if (COMMITTEE_ROLES.has(r)) return true;
  }
  return false;
}

/**
 * Web `canAccessGuardPage`: guard or society committee, not platform_admin-only tools view.
 * Used for blacklist parity with web.
 */
export function canAccessGuardPage(user: User | null): boolean {
  if (!user) return false;
  const set = getNormalizedRoleSet(user);
  if (set.has('platform_admin')) return false;
  if (set.has('guard')) return true;
  return hasSocietyCommitteeRole(user);
}

/** Web `canAccessCheckin` / `canAccessWalkin` (guard or chair/secretary/treasurer, not platform_admin). */
export function canAccessCheckin(user: User | null): boolean {
  if (!user) return false;
  const set = getNormalizedRoleSet(user);
  if (set.has('platform_admin')) return false;
  if (set.has('guard')) return true;
  return hasSocietyCommitteeRole(user);
}

export function canAccessWalkin(user: User | null): boolean {
  return canAccessCheckin(user);
}

/**
 * Sign up a new user.
 */
export async function signup(data: {
  email: string;
  password: string;
  full_name: string;
  society_slug: string;
  role: 'guard' | 'resident';
  building_id?: string | null;
  phone?: string;
  flat_number?: string;
}): Promise<{ user: User | null; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errBody: unknown = await response.json().catch(() => ({}));
      return {
        user: null,
        error: apiErrorDetail(errBody) || 'Signup failed',
      };
    }

    const result = parseAuthSuccess(await response.json());
    if (!result) {
      return { user: null, error: 'Invalid response' };
    }

    if (result.access_token) {
      await setSecureToken(result.access_token);
    }
    if (result.refresh_token) {
      await setRefreshToken(result.refresh_token);
    }

    if (result.user) {
      await setUserData(result.user);
      return { user: result.user };
    }

    return { user: null, error: 'Invalid response' };
  } catch (error) {
    const url = `${API_BASE_URL}/auth/signup`;
    return {
      user: null,
      error:
        __DEV__ && error instanceof Error
          ? `${error.message} (url: ${url})`
          : error instanceof Error
            ? error.message
            : 'Network error',
    };
  }
}

/**
 * Login with email and password.
 */
export async function login(
  email: string,
  password: string,
): Promise<{ user: User | null; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errBody: unknown = await response.json().catch(() => ({}));
      return {
        user: null,
        error: apiErrorDetail(errBody) || 'Login failed',
      };
    }

    const data = parseAuthSuccess(await response.json());
    if (!data) {
      return { user: null, error: 'Invalid response' };
    }

    if (data.access_token) {
      await setSecureToken(data.access_token);
    }
    if (data.refresh_token) {
      await setRefreshToken(data.refresh_token);
    }

    if (data.user) {
      await setUserData(data.user);
      return { user: data.user };
    }

    return { user: null, error: 'Invalid response' };
  } catch (error) {
    const url = `${API_BASE_URL}/auth/login`;
    return {
      user: null,
      error:
        __DEV__ && error instanceof Error
          ? `${error.message} (url: ${url})`
          : error instanceof Error
            ? error.message
            : 'Network error',
    };
  }
}

/**
 * Demo login via backend API.
 */
export async function demoLogin(): Promise<{ user: User | null; error?: string }> {
  return { user: null, error: 'Demo login is disabled. Please use real credentials.' };
}

/**
 * Logout and clear all auth data.
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } catch {
    // Ignore errors
  }
  await clearAllAuthData();
}

/**
 * Get current user from cache or API.
 */
export async function getCurrentUser(forceRefresh = false): Promise<User | null> {
  if (!forceRefresh) {
    const cached = await getUserData<User>();
    if (cached) return cached;
  }

  const response = await apiClient.get<unknown>('/auth/me');
  if (response.data) {
    const user = normalizeUserPayload(response.data);
    if (user) {
      await setUserData(user);
      return user;
    }
  }

  return await getUserData<User>();
}

/**
 * Update profile (name / email). Persists new access token when the backend returns one.
 */
export async function updateProfile(updates: {
  full_name?: string;
  email?: string;
}): Promise<{ user: User | null; error?: string }> {
  const response = await apiClient.patch<Record<string, unknown>>('/auth/me', updates);
  if (response.error) {
    return { user: null, error: response.error };
  }
  const raw = response.data;
  if (!raw || typeof raw !== 'object') {
    return { user: null, error: 'Invalid response' };
  }
  const data = raw as Record<string, unknown>;
  if (typeof data.access_token === 'string') {
    await setSecureToken(data.access_token);
  }
  const { access_token: _a, token_type: _t, ...rest } = data;
  const user = normalizeUserPayload(rest);
  if (user) {
    await setUserData(user);
    return { user };
  }
  return { user: null, error: 'Invalid response' };
}

export async function setToken(token: string): Promise<void> {
  await setSecureToken(token);
}

export async function getToken(): Promise<string | null> {
  return await getSecureToken();
}

export async function removeToken(): Promise<void> {
  await removeSecureToken();
  await removeRefreshToken();
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getSecureToken();
  return token !== null;
}

export async function getCachedUser(): Promise<User | null> {
  return await getUserData<User>();
}
