import { QueryProvider } from "@/providers/QueryProvider";

/**
 * Public pass/QR routes — no auth required, minimal chrome.
 * Only provides React Query for data fetching.
 */
export default function PassLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <main className="min-h-screen">{children}</main>
    </QueryProvider>
  );
}
