"use client";

import { usePathname } from "next/navigation";
import { theme } from "@/lib/theme";
import Header from "./Header";
import Footer from "./Footer";

// Public/marketing routes that have their own Navbar/Footer in (public) layout
const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/features",
  "/how-it-works",
  "/use-cases",
  "/contact",
  "/faq",
  "/privacy",
];

/**
 * Renders Header + main + Footer for most routes.
 * For auth routes, full-viewport wrapper.
 * For public/marketing, skips Header/Footer (handled by (public) layout).
 * For /platform (superadmin), skips Header/Footer — platform layout has its own AdminHeader + AdminSidebar.
 */
export default function ConditionalShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/register-society";

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // Platform admin: own layout with AdminHeader + AdminSidebar — no global navbar/footer
  const isPlatformRoute = pathname === "/platform" || pathname.startsWith("/platform/");

  // Auth routes: full-viewport wrapper
  if (isAuthRoute) {
    return (
      <div className={`h-screen overflow-hidden flex flex-col ${theme.surface.page}`}>
        {children}
      </div>
    );
  }

  // Public/marketing routes: skip Header/Footer (handled by (public) layout)
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Platform routes: no global Header/Footer (platform layout provides its own chrome)
  if (isPlatformRoute) {
    return <>{children}</>;
  }

  // All other routes: standard Header + main + Footer
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
