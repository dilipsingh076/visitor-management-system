/**
 * Authentication utilities.
 * Supports both httpOnly cookie auth (secure) and localStorage fallback (demo).
 */

const USE_DEMO_AUTH = process.env.NEXT_PUBLIC_USE_DEMO_AUTH !== "false";
const KEYCLOAK_URL = process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost:8080";
const KEYCLOAK_REALM = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "vms";
const KEYCLOAK_CLIENT_ID = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "vms-frontend";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

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
  society_id?: string;
  building_id?: string;
  society?: SocietySummary;
}

export const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  guard: "Guard",
  resident: "Resident",
  super_admin: "Platform Admin",
};

export function getPrimaryRole(user: User | null): string {
  if (!user) return "resident";
  if (user.role) return user.role;
  const roles = user.roles || [];
  if (roles.includes("super_admin")) return "super_admin";
  if (roles.includes("admin")) return "admin";
  if (roles.includes("guard")) return "guard";
  if (roles.includes("resident")) return "resident";
  return roles[0] || "resident";
}

export function canAccessPlatform(user: User | null): boolean {
  const role = getPrimaryRole(user);
  return role === "super_admin";
}

export function canInviteVisitor(user: User | null): boolean {
  const role = getPrimaryRole(user);
  return role === "resident" || role === "admin";
}

export function canAccessGuardPage(user: User | null): boolean {
  const role = getPrimaryRole(user);
  return role === "guard" || role === "admin";
}

export function canAccessCheckin(user: User | null): boolean {
  const role = getPrimaryRole(user);
  return role === "guard" || role === "admin";
}

export function canAccessWalkin(user: User | null): boolean {
  const role = getPrimaryRole(user);
  return role === "guard" || role === "admin";
}

export const authConfig = {
  useDemoAuth: USE_DEMO_AUTH,
  keycloakUrl: KEYCLOAK_URL,
  realm: KEYCLOAK_REALM,
  clientId: KEYCLOAK_CLIENT_ID,
  redirectUri: typeof window !== "undefined" ? window.location.origin : "",
};

export function getLoginUrl(): string {
  if (authConfig.useDemoAuth) return "/login";
  const params = new URLSearchParams({
    client_id: authConfig.clientId,
    redirect_uri: authConfig.redirectUri,
    response_type: "code",
    scope: "openid profile email",
  });
  return `${authConfig.keycloakUrl}/realms/${authConfig.realm}/protocol/openid-connect/auth?${params}`;
}

export function getLogoutUrl(): string {
  if (authConfig.useDemoAuth) return "/";
  const params = new URLSearchParams({
    redirect_uri: authConfig.redirectUri,
  });
  return `${authConfig.keycloakUrl}/realms/${authConfig.realm}/protocol/openid-connect/logout?${params}`;
}

// Auth state stored in memory for current session
let _currentUser: User | null = null;
let _isAuthenticated: boolean = false;

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
  society_slug?: string;
  building_id?: string;
}): Promise<{ user: User | null; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return { user: null, error: err.detail || "Signup failed" };
    }

    const result = await response.json();
    const user = result.user as User;
    if (result.society) user.society = result.society as SocietySummary;
    const accessToken = result.access_token as string | undefined;

    _currentUser = user;
    _isAuthenticated = true;

    if (typeof window !== "undefined") {
      sessionStorage.setItem("vms_user", JSON.stringify(user));
      if (accessToken) localStorage.setItem("access_token", accessToken);
    }

    return { user };
  } catch (error) {
    return { user: null, error: error instanceof Error ? error.message : "Network error" };
  }
}

/**
 * Register a new society and its first admin (building manager).
 */
export async function registerSociety(data: {
  society_name: string;
  society_slug?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  contact_email: string;
  contact_phone?: string;
  registration_number?: string;
  society_type?: string;
  registration_year?: string;
  buildings?: { name: string; code?: string }[];
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  flat_number?: string;
}): Promise<{ user: User | null; society?: { id: string; slug: string; name: string }; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register-society`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const detail = err.detail;
      const message = typeof detail === "string" ? detail : Array.isArray(detail) ? (detail[0]?.msg || "Registration failed") : "Registration failed";
      return { user: null, error: message };
    }

    const result = await response.json();
    const user = result.user as User;
    const society = result.society as SocietySummary | undefined;
    if (society) user.society = society;
    const accessToken = result.access_token as string | undefined;

    _currentUser = user;
    _isAuthenticated = true;

    if (typeof window !== "undefined") {
      sessionStorage.setItem("vms_user", JSON.stringify(user));
      if (accessToken) localStorage.setItem("access_token", accessToken);
    }

    return { user, society };
  } catch (error) {
    return { user: null, error: error instanceof Error ? error.message : "Network error" };
  }
}

/**
 * Login with email and password.
 */
export async function login(email: string, password: string): Promise<{ user: User | null; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return { user: null, error: err.detail || "Login failed" };
    }

    const data = await response.json();
    const user = data.user as User;
    if (data.society) user.society = data.society as SocietySummary;
    const accessToken = data.access_token as string | undefined;

    _currentUser = user;
    _isAuthenticated = true;

    if (typeof window !== "undefined") {
      sessionStorage.setItem("vms_user", JSON.stringify(user));
      if (accessToken) localStorage.setItem("access_token", accessToken);
    }

    return { user };
  } catch (error) {
    return { user: null, error: error instanceof Error ? error.message : "Network error" };
  }
}

/**
 * Demo login via backend API.
 * Backend sets httpOnly cookie for secure token storage.
 */
export async function demoLogin(email: string, role: string): Promise<{ user: User | null; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login/demo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, role }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return { user: null, error: err.detail || "Login failed" };
    }

    const data = await response.json();
    const user = data.user as User;
    const accessToken = data.access_token as string | undefined;

    _currentUser = user;
    _isAuthenticated = true;

    if (typeof window !== "undefined") {
      sessionStorage.setItem("vms_user", JSON.stringify(user));
      if (accessToken) localStorage.setItem("access_token", accessToken);
    }

    return { user };
  } catch (error) {
    return { user: null, error: error instanceof Error ? error.message : "Network error" };
  }
}

/**
 * Logout via backend API.
 * Backend clears httpOnly cookie.
 */
export async function logout(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // Ignore errors, clear local state anyway
  }
  
  _currentUser = null;
  _isAuthenticated = false;
  
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("vms_user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("demo_user");
  }
}

/**
 * Fetch current user from backend.
 * Returns cached user if available, otherwise fetches from API.
 */
export async function getCurrentUser(forceRefresh = false): Promise<User | null> {
  if (_currentUser && !forceRefresh) {
    return _currentUser;
  }
  
  if (typeof window !== "undefined" && !forceRefresh) {
    const stored = sessionStorage.getItem("vms_user");
    if (stored) {
      try {
        _currentUser = JSON.parse(stored) as User;
        _isAuthenticated = true;
        return _currentUser;
      } catch {
        sessionStorage.removeItem("vms_user");
      }
    }
  }
  
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      credentials: "include",
      headers,
    });
    
    if (!response.ok) {
      _currentUser = null;
      _isAuthenticated = false;
      return null;
    }
    
    const data = await response.json();
    const user = data as User & { society?: SocietySummary };
    if (data.society) user.society = data.society;
    _currentUser = user;
    _isAuthenticated = true;
    
    if (typeof window !== "undefined") {
      sessionStorage.setItem("vms_user", JSON.stringify(user));
    }
    
    return user;
  } catch {
    _currentUser = null;
    _isAuthenticated = false;
    return null;
  }
}

export function isAuthenticated(): boolean {
  if (_isAuthenticated) return true;
  
  if (typeof window !== "undefined") {
    const stored = sessionStorage.getItem("vms_user");
    if (stored) {
      _isAuthenticated = true;
      return true;
    }
  }
  
  return false;
}

export function getCachedUser(): User | null {
  if (_currentUser) return _currentUser;
  
  if (typeof window !== "undefined") {
    const stored = sessionStorage.getItem("vms_user");
    if (stored) {
      try {
        return JSON.parse(stored) as User;
      } catch {
        return null;
      }
    }
  }
  
  return null;
}

// Legacy functions for backward compatibility
export function setToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", token);
  }
}

export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
}

export function removeToken(): void {
  logout();
}

export function setDemoUser(user: User): void {
  _currentUser = user;
  _isAuthenticated = true;
  if (typeof window !== "undefined") {
    sessionStorage.setItem("vms_user", JSON.stringify(user));
  }
}

export function getDemoUser(): User | null {
  return getCachedUser();
}
