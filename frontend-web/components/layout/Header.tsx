"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ShieldCheck, Menu, X } from "lucide-react";
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
  canAccessMeetingsAI,
} from "@/lib/auth";
import { useAuthContext } from "@/features/auth";
import { Badge, Button, Container, LinkButton, NavLink, NavDropdown } from "@/components/ui";
import { NotificationBell } from "./NotificationBell";

type NavItem =
  | { href: string; label: string }
  | { label: string; children: { href: string; label: string }[] };

function isDropdown(item: NavItem): item is { label: string; children: { href: string; label: string }[] } {
  return "children" in item;
}

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
  ];

  // Visitors group: always includes Visitors, conditionally Check-in and Walk-in
  const visitorsChildren: { href: string; label: string }[] = [
    { href: "/visitors", label: "Visitors" },
  ];
  if (canAccessCheckin(user)) {
    visitorsChildren.push({ href: "/checkin", label: "Check-in" });
  }
  if (canAccessWalkin(user)) {
    visitorsChildren.push({ href: "/checkin/walkin", label: "Walk-in" });
  }
  // Only show as dropdown if there are sub-items beyond Visitors
  if (visitorsChildren.length > 1) {
    items.push({ label: "Visitors", children: visitorsChildren });
  } else {
    items.push({ href: "/visitors", label: "Visitors" });
  }

  // Keep /guard link for committee/admin; guards use /dashboard as their dashboard.
  if (primaryRole !== "guard" && canAccessGuardPage(user)) {
    items.push({ href: "/guard", label: "Guard" });
  }

  if (primaryRole !== "guard") {
    items.push({ href: "/flat", label: "My Flat" });
    items.push({ href: "/notifications", label: "Notifications" });
  }

  // Society group for committee members
  if (canAccessSocietyManagement(user)) {
    items.push({
      label: "Society",
      children: [
        { href: "/admin/users", label: "Management" },
        { href: "/admin/buildings", label: "Buildings" },
        { href: "/admin/amenities", label: "Amenities" },
        { href: "/admin/staff", label: "Staff" },
        { href: "/admin/complaints", label: "Complaints" },
        { href: "/admin/settings", label: "Settings" },
      ],
    });
  }

  if (canAccessMeetingsAI(user)) {
    items.push({ href: "/admin/meetings", label: "Meeting Details" });
  }

  if (primaryRole !== "guard") {
    items.push({ href: "/admin/nearby-places", label: "Nearby" });
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
        <div className="flex items-center justify-between py-3 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href={authenticated && user ? getLandingPage(user) : "/"} className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
              <span className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-5 h-5 text-white" aria-hidden />
              </span>
              <span className="text-lg font-bold text-foreground tracking-tight">VMS</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex flex-wrap items-center gap-x-0.5 gap-y-1">
              {navItems.map((item) =>
                isDropdown(item) ? (
                  <NavDropdown key={item.label} label={item.label} children={item.children} />
                ) : (
                  <NavLink key={item.href} href={item.href}>
                    {item.label}
                  </NavLink>
                )
              )}
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
              {mobileOpen ? <X className="w-5 h-5" aria-hidden /> : <Menu className="w-5 h-5" aria-hidden />}
            </button>
          </div>
        </div>

        {/* Mobile nav panel */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border pt-2 pb-3 space-y-2">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) =>
                isDropdown(item) ? (
                  <div key={item.label}>
                    <p className="px-3.5 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {item.label}
                    </p>
                    {item.children.map((child) => (
                      <NavLink key={child.href} href={child.href} className="w-full justify-start pl-6">
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                ) : (
                  <NavLink key={item.href} href={item.href} className="w-full justify-start">
                    {item.label}
                  </NavLink>
                )
              )}
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
