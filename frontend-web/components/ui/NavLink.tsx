"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { theme } from "@/lib/theme";

export interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  exact?: boolean;
}

export function NavLink({ href, children, className = "", exact }: NavLinkProps) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
  const linkClass = `${theme.navLink.base} ${active ? theme.navLink.active : theme.navLink.inactive} ${className}`.trim();
  return (
    <Link href={href} className={linkClass}>
      {children}
    </Link>
  );
}
