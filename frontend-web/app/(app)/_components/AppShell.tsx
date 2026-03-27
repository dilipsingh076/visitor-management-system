"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/features/auth";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { SosIncidentBanner } from "@/components/layout/SosIncidentBanner";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthContext();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Server render + first client render: consistent baseline (no sidebar)
  // This prevents hydration mismatch since auth state comes from localStorage
  if (!mounted || !isAuthenticated || !user) {
    return (
      <div className="app-page">
        <main className="min-h-screen">{children}</main>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden app-sidebar-layout">
      <AppSidebar
        user={user}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        <AppHeader
          user={user}
          onMenuClick={() => setMobileOpen(true)}
        />
        <SosIncidentBanner user={user} />
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}
