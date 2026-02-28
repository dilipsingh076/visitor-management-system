/**
 * Authenticated app layout. Use for dashboard, guard, visitors, checkin, blacklist, admin, platform.
 * Does not affect URL (route group). Add shared shell (e.g. sidebar) here if needed.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
