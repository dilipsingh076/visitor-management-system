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
  const value: AuthContextValue = {
    user,
    loading,
    isAuthenticated,
    refetch,
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
