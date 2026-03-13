"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  removeToken,
  getPrimaryRole,
  getLandingPage,
  ROLE_LABELS,
  getRoleResponsibility,
  canAccessGuardPage,
  canAccessCheckin,
  canAccessWalkin,
  canAccessPlatform,
  canAccessSocietyManagement,
} from "@/lib/auth";
import { useAuthContext } from "@/features/auth";
import { Badge, Button, Container, LinkButton, NavLink } from "@/components/ui";
import { NotificationBell } from "./NotificationBell";

type NavItem = {
  href: string;
  label: string;
};

function getNavItemsForUser(user: Parameters<typeof getPrimaryRole>[0] | null): NavItem[] {
  if (!user) {
    return [
      { href: "/features", label: "Features" },
      { href: "/use-cases", label: "Use Cases" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ];
  }

  const primaryRole = getPrimaryRole(user);

  // Platform admin: navigation focused on platform admin panel.
  if (primaryRole === "platform_admin") {
    return [
      { href: "/platform", label: "Platform Admin" },
    ];
  }

  const items: NavItem[] = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/visitors", label: "Visitors" },
    { href: "/notifications", label: "Notifications" },
  ];

  if (canAccessCheckin(user)) {
    items.push({ href: "/checkin", label: "Check-in" });
  }
  if (canAccessWalkin(user)) {
    items.push({ href: "/checkin/walkin", label: "Walk-in" });
  }
  if (canAccessGuardPage(user)) {
    items.push({ href: "/guard", label: "Guard" });
    items.push({ href: "/blacklist", label: "Blacklist" });
  }
  if (canAccessSocietyManagement(user)) {
    items.push({ href: "/admin/users", label: "Management" });
    items.push({ href: "/admin/buildings", label: "Buildings" });
    items.push({ href: "/admin/amenities", label: "Amenities" });
    items.push({ href: "/admin/staff", label: "Staff" });
    items.push({ href: "/admin/complaints", label: "Complaints" });
    items.push({ href: "/admin/settings", label: "Settings" });
  }
  if (canAccessPlatform(user)) {
    items.push({ href: "/platform", label: "Platform Admin" });
  }

  return items;
}

/** Render auth-dependent nav only after mount to avoid hydration mismatch (auth comes from client storage). */
export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated } = useAuthContext();

  useEffect(() => {
    setMounted(true);
  }, []);

  const authenticated = mounted && isAuthenticated;

  const handleLogout = () => {
    removeToken();
    window.location.href = "/";
  };

  const navItems = useMemo(
    () => getNavItemsForUser(authenticated ? user ?? null : null),
    [authenticated, user]
  );

  const roleLabel =
    user && ROLE_LABELS[getPrimaryRole(user)] ? ROLE_LABELS[getPrimaryRole(user)] : user ? getPrimaryRole(user) : "";

  return (
    <header className="sticky top-0 z-50 bg-card/95 border-b border-border backdrop-blur-md shadow-[var(--shadow-header)]">
      <Container>
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href={authenticated && user ? getLandingPage(user) : "/"} className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
              <span className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </span>
              <span className="text-lg font-bold text-foreground tracking-tight">VMS</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex flex-wrap items-center gap-0.5">
              {navItems.map((item) => (
                <NavLink key={item.href} href={item.href}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {authenticated ? (
              <>
                {user && (
                  <>
                    <NotificationBell user={user} />
                    <span className="hidden sm:inline-flex items-center gap-2 text-sm text-muted-foreground max-w-[14rem] truncate">
                      <span className="text-foreground font-medium truncate">{user.username}</span>
                      <span className="text-border">·</span>
                      <Badge
                        variant="primary"
                        size="sm"
                        title={getRoleResponsibility(getPrimaryRole(user))}
                      >
                        {roleLabel}
                      </Badge>
                    </span>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:inline-flex text-muted-foreground hover:text-foreground"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <LinkButton href="/login" variant="primary" size="md">
                Login
              </LinkButton>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted-bg md:hidden"
              aria-label="Toggle navigation"
              onClick={() => setMobileOpen((open) => !open)}
            >
              <span className="sr-only">Toggle navigation</span>
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                {mobileOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M3 7h18M3 12h18M3 17h18" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile nav panel */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border pt-2 pb-3 space-y-2">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink key={item.href} href={item.href} className="w-full justify-start">
                  {item.label}
                </NavLink>
              ))}
            </nav>
            {authenticated && user && (
              <div className="mt-2 flex items-center justify-between gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-foreground font-medium truncate">{user.username}</span>
                  <Badge
                    variant="primary"
                    size="sm"
                    title={getRoleResponsibility(getPrimaryRole(user))}
                  >
                    {roleLabel}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
        )}
      </Container>
    </header>
  );
}
