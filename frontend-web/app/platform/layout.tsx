"use client";

import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { useAuth } from "@/features/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageLoader, ToastProvider } from "./components";

export default function PlatformAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (!loading && user) {
      const roles = (user.roles || (user.role ? [user.role] : [])).map((r) => String(r).toLowerCase());
      if (!roles.includes("platform_admin")) {
        router.replace("/dashboard");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-muted-bg">
        <PageLoader message="Loading…" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const roles = (user.roles || (user.role ? [user.role] : [])).map((r) => String(r).toLowerCase());
  if (!roles.includes("platform_admin")) {
    return null;
  }

  return (
    <ToastProvider>
      <div className="h-screen flex bg-muted-bg overflow-hidden">
        {/* Desktop sidebar */}
        <AdminSidebar />

        {/* Mobile sidebar overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Mobile sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-card transform transition-transform duration-300 md:hidden ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <AdminSidebar />
        </div>

        {/* Main content: min-h-0 so flex child can scroll */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          <AdminHeader onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
          <main className="flex-1 min-h-0 overflow-y-auto overflow-x-auto p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
