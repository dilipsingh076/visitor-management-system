"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPrimaryRole } from "@/lib/auth";
import { useAuth } from "@/features/auth";
import { GuardPageContent } from "./GuardPageContent";

/**
 * /guard is a compatibility route:
 * - Guard users are redirected to /dashboard (their new home).
 * - Committee/admin users can still access /guard.
 */
export function GuardRouteGate() {
  const router = useRouter();
  const { user, loading } = useAuth({ requireAuth: true });

  useEffect(() => {
    if (loading) return;
    if (user && getPrimaryRole(user) === "guard") {
      router.replace("/dashboard");
    }
  }, [loading, router, user]);

  if (loading) return null;
  if (user && getPrimaryRole(user) === "guard") return null;

  return <GuardPageContent />;
}

