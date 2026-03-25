import { ClientProviders } from "@/providers/ClientProviders";
import { theme } from "@/lib/theme";

/**
 * Auth routes: login, signup, register-society.
 * Provides auth + React Query; full-viewport shell matches previous ConditionalShell behavior.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientProviders>
      <div
        className={`h-screen overflow-hidden flex flex-col ${theme.surface.page}`}
      >
        {children}
      </div>
    </ClientProviders>
  );
}
