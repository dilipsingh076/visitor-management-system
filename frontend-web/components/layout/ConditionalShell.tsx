"use client";

import { usePathname } from "next/navigation";
import { theme } from "@/lib/theme";
import Header from "./Header";
import Footer from "./Footer";

/**
 * Renders Header + main + Footer for most routes.
 * For auth routes, renders a full-viewport wrapper so the page controls its own scroll.
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

  if (isAuthRoute) {
    return (
      <div className={`h-screen overflow-hidden flex flex-col ${theme.surface.page}`}>
        {children}
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
