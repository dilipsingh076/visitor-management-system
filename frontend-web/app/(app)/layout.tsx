import { ClientProviders } from "@/providers/ClientProviders";
import { AppShell } from "./_components/AppShell";

/**
 * Authenticated app routes: dashboard, visitors, checkin, guard, admin, etc.
 * Provides auth + React Query + app chrome (Sidebar / Header).
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientProviders>
      <AppShell>{children}</AppShell>
    </ClientProviders>
  );
}
