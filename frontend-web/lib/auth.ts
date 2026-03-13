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

/** Real-world roles: Chairman, Secretary, Treasurer, Resident, Guard, Platform Admin */
export const ROLE_LABELS: Record<string, string> = {
  chairman: "Chairman",
  secretary: "Secretary",
  treasurer: "Treasurer",
  resident: "Resident",
  guard: "Guard",
  platform_admin: "Platform Admin",
};

/** Short responsibility line for UI (dashboard headers, empty states) */
export const ROLE_RESPONSIBILITIES: Record<string, string> = {
  chairman: "Full society control: users, buildings, blacklist & reports",
  secretary: "Day-to-day operations: users, visitors & reports",
  treasurer: "Society oversight: users, blacklist & reports",
  resident: "Invite visitors and manage your visit approvals",
  guard: "Check-in, walk-in, blacklist & muster at the gate",
  platform_admin: "Manage all societies and platform settings",
};

export function getRoleResponsibility(role: string): string {
  return ROLE_RESPONSIBILITIES[role] ?? "View and manage according to your role";
};

/** True if role is committee (Chairman, Secretary, Treasurer) or Platform Admin */
export function isSocietyAdmin(role: string): boolean {
  return (
    role === "platform_admin" ||
    role === "chairman" ||
    role === "secretary" ||
    role === "treasurer"
  );
}

/** True if role is society committee only (Chairman, Secretary, Treasurer) — not Platform Admin */
export function isCommittee(role: string): boolean {
  return role === "chairman" || role === "secretary" || role === "treasurer";
}

export function getPrimaryRole(user: User | null): string {
  if (!user) return "resident";
  if (user.role) return user.role;
  const roles = user.roles || [];
  const order = ["platform_admin", "chairman", "secretary", "treasurer", "guard", "resident"];
  for (const r of order) {
    if (roles.includes(r)) return r;
  }
  return roles[0] || "resident";
}

export function canAccessPlatform(user: User | null): boolean {
  return getPrimaryRole(user) === "platform_admin";
}

/**
 * Get the appropriate landing page for a user based on their role.
 * Platform admins go to /platform, guards to /guard, others to /dashboard.
 */
export function getLandingPage(user: User | null): string {
  const role = getPrimaryRole(user);
  if (role === "platform_admin") return "/platform";
  if (role === "guard") return "/guard";
  return "/dashboard";
}

export function canInviteVisitor(user: User | null): boolean {
  const role = getPrimaryRole(user);
  if (role === "platform_admin") return false;
  return role === "resident" || isSocietyAdmin(role);
}

export function canAccessGuardPage(user: User | null): boolean {
  const role = getPrimaryRole(user);
  if (role === "platform_admin") return false;
  return role === "guard" || isSocietyAdmin(role);
}

export function canAccessCheckin(user: User | null): boolean {
  const role = getPrimaryRole(user);
  if (role === "platform_admin") return false;
  return role === "guard" || isSocietyAdmin(role);
}

export function canAccessWalkin(user: User | null): boolean {
  const role = getPrimaryRole(user);
  if (role === "platform_admin") return false;
  return role === "guard" || isSocietyAdmin(role);
}

/** Committee (Chairman/Secretary/Treasurer) can access Society Management — users, settings */
export function canAccessSocietyManagement(user: User | null): boolean {
  return isCommittee(getPrimaryRole(user));
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

const AUTH_COOKIE_NAME = "vms_access";

function setAuthCookie(token: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=2592000; SameSite=Lax`;
}

function clearAuthCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0`;
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
      if (accessToken) {
        localStorage.setItem("access_token", accessToken);
        setAuthCookie(accessToken);
      }
    }

    return { user };
  } catch (error) {
    return { user: null, error: error instanceof Error ? error.message : "Network error" };
  }
}

/**
 * Register a new society and its first admin (building manager).
 */
/**
 * Extract error message from API error response (JSON or text).
 * Backend returns { detail: string } or { detail: [{ msg: string }] } for validation.
 */
function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "detail" in err) {
    const d = (err as { detail?: unknown }).detail;
    if (typeof d === "string") return d;
    if (Array.isArray(d) && d[0] && typeof d[0] === "object" && "msg" in d[0]) return String((d[0] as { msg: string }).msg);
  }
  return fallback;
}

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
  admin_building_index?: number;
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  flat_number?: string;
}): Promise<{ user: User | null; society?: { id: string; slug: string; name: string }; error?: string }> {
  const url = `${API_BASE_URL}/auth/register-society`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const responseText = await response.text();
    if (!response.ok) {
      let err: unknown = {};
      try {
        err = responseText ? JSON.parse(responseText) : {};
      } catch {
        err = { detail: responseText || `HTTP ${response.status}` };
      }
      const message = getErrorMessage(err, `Registration failed (${response.status})`);
      if (typeof window !== "undefined") {
        console.error("[registerSociety] API error:", response.status, response.statusText, err);
      }
      return { user: null, error: message };
    }

    let result: { user?: User; society?: SocietySummary; access_token?: string };
    try {
      result = responseText ? JSON.parse(responseText) : {};
    } catch {
      if (typeof window !== "undefined") console.error("[registerSociety] Invalid JSON:", responseText?.slice(0, 200));
      return { user: null, error: "Invalid response from server" };
    }

    const user = result.user as User;
    const society = result.society as SocietySummary | undefined;
    if (society && user) user.society = society;
    const accessToken = result.access_token as string | undefined;

    _currentUser = user;
    _isAuthenticated = true;

    if (typeof window !== "undefined") {
      sessionStorage.setItem("vms_user", JSON.stringify(user));
      if (accessToken) {
        localStorage.setItem("access_token", accessToken);
        setAuthCookie(accessToken);
      }
    }

    return { user, society };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error";
    if (typeof window !== "undefined") {
      console.error("[registerSociety] Request failed:", url, error);
    }
    return { user: null, error: message };
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
      if (accessToken) {
        localStorage.setItem("access_token", accessToken);
        setAuthCookie(accessToken);
      }
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
      if (accessToken) {
        localStorage.setItem("access_token", accessToken);
        setAuthCookie(accessToken);
      }
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
    clearAuthCookie();
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
    setAuthCookie(token);
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
