"use client";

import { ClientProviders } from "@/providers/ClientProviders";
import Header from "./Header";
import Footer from "./Footer";

/**
 * Auth + React Query + main app chrome (Header / Footer) for resident/admin/guard routes.
 * Used from segment layouts (e.g. app/dashboard/layout.tsx) so marketing pages stay free of this bundle.
 */
export function MainAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientProviders>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </ClientProviders>
  );
}
