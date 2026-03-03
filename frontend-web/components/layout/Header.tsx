"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { removeToken, getPrimaryRole, ROLE_LABELS, getRoleResponsibility, canAccessGuardPage, canAccessCheckin, canAccessWalkin, canAccessPlatform, canAccessSocietyManagement } from "@/lib/auth";
import { useAuthContext } from "@/features/auth";
import { Badge, Button, Container, LinkButton, NavLink } from "@/components/ui";

/** Render auth-dependent nav only after mount to avoid hydration mismatch (auth comes from client storage). */
export default function Header() {
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated } = useAuthContext();

  useEffect(() => {
    setMounted(true);
  }, []);

  const authenticated = mounted && isAuthenticated;

  const handleLogout = () => {
    removeToken();
    window.location.href = "/";
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <Container>
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
                  <NavLink href="/dashboard">Dashboard</NavLink>
                  <NavLink href="/visitors">Visitors</NavLink>
                  {canAccessCheckin(user) && <NavLink href="/checkin">Check-in</NavLink>}
                  {canAccessWalkin(user) && <NavLink href="/checkin/walkin">Walk-in</NavLink>}
                  {canAccessGuardPage(user) && <NavLink href="/guard">Guard</NavLink>}
                  {canAccessSocietyManagement(user) && <NavLink href="/admin/users">Management</NavLink>}
                  {canAccessPlatform(user) && <NavLink href="/platform/societies">Platform</NavLink>}
                </>
              ) : authenticated ? (
                <>
                  <NavLink href="/dashboard">Dashboard</NavLink>
                  <NavLink href="/visitors">Visitors</NavLink>
                </>
              ) : (
                <>
                  <NavLink href="/features">Features</NavLink>
                  <NavLink href="/use-cases">Use Cases</NavLink>
                  <NavLink href="/how-it-works">How it works</NavLink>
                  <NavLink href="/about">About</NavLink>
                  <NavLink href="/contact">Contact</NavLink>
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {authenticated ? (
              <>
                {user && (
                  <span className="hidden sm:inline text-sm text-muted-foreground flex items-center gap-2">
                    <span className="text-foreground font-medium">{user.username}</span>
                    <span className="mx-1.5">·</span>
                    <Badge
                      variant="primary"
                      size="sm"
                      title={getRoleResponsibility(getPrimaryRole(user))}
                    >
                      {ROLE_LABELS[getPrimaryRole(user)] ?? getPrimaryRole(user)}
                    </Badge>
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
      </Container>
    </header>
  );
}
