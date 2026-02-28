/**
 * Auth layout. Wraps all authenticated routes: login, dashboard, guard, visitors, checkin, blacklist, admin, platform.
 * RBAC/route protection is handled by middleware; role-based UI is in page content.
 * Does not affect URL (route group).
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
