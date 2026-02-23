"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isAuthenticated, removeToken, getDemoUser, getPrimaryRole, ROLE_LABELS, canAccessGuardPage, canAccessCheckin, canAccessWalkin, canAccessPlatform } from "@/lib/auth";
import { Button, LinkButton } from "@/components/ui";
import { apiClient } from "@/lib/api";
import { API } from "@/lib/api/endpoints";
import type { User } from "@/lib/auth";

export default function Header() {
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const ok = isAuthenticated();
    setAuthenticated(ok);
    if (ok) {
      const demo = getDemoUser();
      if (demo) {
        setUser(demo);
      } else {
        apiClient.get<User>(API.auth.me).then((res) => {
          if (res.data) setUser(res.data);
        });
      }
    } else {
      setUser(null);
    }
  }, [pathname]);

  const handleLogout = () => {
    removeToken();
    window.location.href = "/";
  };

  const navLink = (href: string, label: string) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
          active
            ? "bg-primary-light text-primary"
            : "text-muted hover:bg-muted-bg hover:text-foreground"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </span>
              <span className="text-lg font-bold text-foreground">VMS</span>
            </Link>
            <nav className="flex flex-wrap items-center gap-1">
              {authenticated && user ? (
                <>
                  {navLink("/dashboard", "Dashboard")}
                  {navLink("/visitors", "Visitors")}
                  {canAccessCheckin(user) && navLink("/checkin", "Check-in")}
                  {canAccessWalkin(user) && navLink("/checkin/walkin", "Walk-in")}
                  {canAccessGuardPage(user) && navLink("/guard", "Guard")}
                  {canAccessPlatform(user) && navLink("/platform/societies", "Platform")}
                </>
              ) : authenticated ? (
                <>
                  {navLink("/dashboard", "Dashboard")}
                  {navLink("/visitors", "Visitors")}
                </>
              ) : (
                <>
                  {navLink("/features", "Features")}
                  {navLink("/use-cases", "Use Cases")}
                  {navLink("/how-it-works", "How it works")}
                  {navLink("/about", "About")}
                  {navLink("/contact", "Contact")}
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {authenticated ? (
              <>
                {user && (
                  <span className="hidden sm:inline text-sm text-muted">
                    <span className="text-foreground font-medium">{user.username}</span>
                    <span className="mx-1.5">·</span>
                    <span
                      className="px-2 py-0.5 rounded font-medium bg-primary-light text-primary"
                      title="Your assigned role"
                    >
                      {ROLE_LABELS[getPrimaryRole(user)] ?? getPrimaryRole(user)}
                    </span>
                  </span>
                )}
                <Button variant="ghost" size="md" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <LinkButton href="/login" variant="primary" size="md">
                Login
              </LinkButton>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
