/**
 * Authentication module with secure token storage.
 */
import { Platform } from 'react-native';
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
import { apiClient } from './api';

function getBaseUrl() {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8000/api/v1';
    }
    return 'http://localhost:8000/api/v1';
  }
  return 'https://your-api-domain.com/api/v1';
}

const API_BASE_URL = getBaseUrl();

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
  useDemoAuth: false,
};

export const ROLE_LABELS: Record<string, string> = {
  guard: 'Guard',
  resident: 'Resident',
};

export function getPrimaryRole(user: User | null): string {
  if (!user) return 'resident';
  if (user.role) return user.role;
  const roles = user.roles || [];
  // Mobile app is resident/guard focused; admin-style roles are treated as residents.
  if (roles.includes('guard')) return 'guard';
  if (
    roles.includes('resident') ||
    roles.includes('chairman') ||
    roles.includes('secretary') ||
    roles.includes('treasurer') ||
    roles.includes('platform_admin') ||
    roles.includes('admin')
  ) {
    return 'resident';
  }
  return roles[0] || 'resident';
}

export function canInviteVisitor(user: User | null): boolean {
  const role = getPrimaryRole(user);
  return role === 'resident';
}

export function canAccessGuardFeatures(user: User | null): boolean {
  const role = getPrimaryRole(user);
  return role === 'guard';
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
      const err = await response.json().catch(() => ({}));
      return { user: null, error: err.detail || 'Signup failed' };
    }

    const result = await response.json();

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
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
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
    if (data.refresh_token) {
      await setRefreshToken(data.refresh_token);
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
  await removeRefreshToken();
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getSecureToken();
  return token !== null;
}

export async function getCachedUser(): Promise<User | null> {
  return await getUserData<User>();
}
