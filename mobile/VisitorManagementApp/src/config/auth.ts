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
} from '../lib/secureStorage';
import { apiClient } from './api';

const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:8001/api/v1'
  : 'https://your-api-domain.com/api/v1';

const KEYCLOAK_URL = __DEV__
  ? 'http://10.0.2.2:8080'
  : 'https://your-keycloak-domain.com';
const KEYCLOAK_REALM = 'vms';
const KEYCLOAK_CLIENT_ID = 'vms-mobile';

export interface User {
  id: string;
  user_id?: string;
  email: string;
  roles: string[];
  role?: string;
  username: string;
}

export const authConfig = {
  keycloakUrl: KEYCLOAK_URL,
  realm: KEYCLOAK_REALM,
  clientId: KEYCLOAK_CLIENT_ID,
  useDemoAuth: __DEV__, // Enable demo login in development
};

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  guard: 'Guard',
  resident: 'Resident',
};

export function getPrimaryRole(user: User | null): string {
  if (!user) return 'resident';
  if (user.role) return user.role;
  const roles = user.roles || [];
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('guard')) return 'guard';
  if (roles.includes('resident')) return 'resident';
  return roles[0] || 'resident';
}

export function canInviteVisitor(user: User | null): boolean {
  const role = getPrimaryRole(user);
  return role === 'resident' || role === 'admin';
}

export function canAccessGuardFeatures(user: User | null): boolean {
  const role = getPrimaryRole(user);
  return role === 'guard' || role === 'admin';
}

/**
 * Sign up a new user.
 */
export async function signup(data: {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  flat_number?: string;
  role?: string;
}): Promise<{ user: User | null; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup?use_cookie=false`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return { user: null, error: err.detail || 'Signup failed' };
    }

    const result = await response.json();

    if (result.access_token) {
      await setSecureToken(result.access_token);
    }

    if (result.user) {
      await setUserData(result.user);
      return { user: result.user };
    }

    return { user: null, error: 'Invalid response' };
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error.message : 'Network error',
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
    const response = await fetch(`${API_BASE_URL}/auth/login?use_cookie=false`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return { user: null, error: err.detail || 'Login failed' };
    }

    const data = await response.json();

    if (data.access_token) {
      await setSecureToken(data.access_token);
    }

    if (data.user) {
      await setUserData(data.user);
      return { user: data.user };
    }

    return { user: null, error: 'Invalid response' };
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Demo login via backend API.
 */
export async function demoLogin(
  email: string,
  role: string,
): Promise<{ user: User | null; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login/demo?use_cookie=false`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return { user: null, error: err.detail || 'Login failed' };
    }

    const data = await response.json();

    if (data.access_token) {
      await setSecureToken(data.access_token);
    }

    if (data.user) {
      await setUserData(data.user);
      return { user: data.user };
    }

    return { user: null, error: 'Invalid response' };
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
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

  const response = await apiClient.get<User>('/auth/me');
  if (response.data) {
    await setUserData(response.data);
    return response.data;
  }

  return null;
}

export async function setToken(token: string): Promise<void> {
  await setSecureToken(token);
}

export async function getToken(): Promise<string | null> {
  return await getSecureToken();
}

export async function removeToken(): Promise<void> {
  await removeSecureToken();
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getSecureToken();
  return token !== null;
}

export async function getCachedUser(): Promise<User | null> {
  return await getUserData<User>();
}
