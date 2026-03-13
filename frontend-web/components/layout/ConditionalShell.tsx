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
 * For auth routes, renders a full-viewport wrapper so the page controls its own scroll.
 * For public/marketing routes, skips Header/Footer (handled by (public) layout).
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

  // All other routes: standard Header + main + Footer
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
