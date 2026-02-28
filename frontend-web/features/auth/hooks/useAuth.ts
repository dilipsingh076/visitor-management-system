"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../context/AuthProvider";
import type { User } from "@/lib/auth";

export interface UseAuthOptions {
  /** Redirect to login if not authenticated */
  requireAuth?: boolean;
  /** Redirect to URL if user doesn't have required role */
  requireRole?: (user: User | null) => boolean;
  redirectTo?: string;
}

export interface UseAuthResult {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  refetch: () => Promise<User | null>;
}

/**
 * Auth state from AuthProvider. Use in pages that need current user
 * and optional role gating with redirect.
 */
export function useAuth(options: UseAuthOptions = {}): UseAuthResult {
  const { requireAuth = true, requireRole, redirectTo } = options;
  const router = useRouter();
  const ctx = useAuthContext();

  useEffect(() => {
    if (!ctx.isAuthenticated && requireAuth) {
      router.push("/login");
      return;
    }
    if (ctx.user && requireRole && redirectTo && !requireRole(ctx.user)) {
      router.replace(redirectTo);
    }
  }, [ctx.isAuthenticated, ctx.user, requireAuth, requireRole, redirectTo, router]);

  return {
    user: ctx.user,
    loading: ctx.loading,
    isAuthenticated: ctx.isAuthenticated,
    refetch: ctx.refetch,
  };
}
