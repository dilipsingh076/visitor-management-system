"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getCachedUser,
  getCurrentUser,
  getDemoUser,
  isAuthenticated as checkAuth,
  type User,
} from "@/lib/auth";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  refetch: () => Promise<User | null>;
  setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async (): Promise<User | null> => {
    const u = (await getCurrentUser(true)) as User | null;
    if (u) setUser(u);
    return u ?? null;
  }, []);

  useEffect(() => {
    if (!checkAuth()) {
      setUser(null);
      setLoading(false);
      return;
    }
    const cached = getCachedUser() as User | null;
    if (cached) setUser(cached);
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token && !document.cookie.includes("vms_access=")) {
        document.cookie = `vms_access=${encodeURIComponent(token)}; path=/; max-age=2592000; SameSite=Lax`;
      }
    }

    const load = async () => {
      const demo = getDemoUser() as User | null;
      if (demo) {
        setUser(demo);
        setLoading(false);
        return;
      }
      const u = (await getCurrentUser(true)) as User | null;
      if (u) setUser(u);
      setLoading(false);
    };
    load();
  }, []);

  const isAuthenticated = Boolean(user ?? checkAuth());
  const resolvedUser = user ?? (checkAuth() ? getCachedUser() : null);
  const value: AuthContextValue = {
    user: resolvedUser,
    loading,
    isAuthenticated,
    refetch,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
}
