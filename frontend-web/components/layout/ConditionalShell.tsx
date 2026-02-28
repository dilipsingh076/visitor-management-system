"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

/**
 * Renders Header + main + Footer for most routes.
 * For /login, renders only a full-viewport wrapper so the login page
 * controls its own scroll (no double scrollbar).
 */
export default function ConditionalShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  if (isLogin) {
    return (
      <div className="h-screen overflow-hidden flex flex-col bg-slate-100">
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
