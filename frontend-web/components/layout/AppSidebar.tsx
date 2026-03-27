"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  QrCode,
  UserPlus,
  Shield,
  ShieldCheck,
  Home,
  Bell,
  Building2,
  Dumbbell,
  UserCog,
  MessageSquare,
  Settings,
  Brain,
  MapPin,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldBan,
  Palette,
  Check,
} from "lucide-react";
import {
  canAccessGuardPage,
  canAccessCheckin,
  canAccessWalkin,
  canAccessSocietyManagement,
  canAccessMeetingsAI,
  getPrimaryRole,
} from "@/lib/auth";
import { theme } from "@/lib/theme";
import { useTheme } from "@/features/theme";
import type { User } from "@/features/auth/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

function getNavGroups(user: User): NavGroup[] {
  const groups: NavGroup[] = [];
  const primaryRole = getPrimaryRole(user);
  const isGuardOnly = primaryRole === "guard";

  // Main
  const main: NavItem[] = [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }];
  if (!isGuardOnly) {
    main.push({ label: "My Flat", href: "/flat", icon: Home });
    main.push({ label: "Notifications", href: "/notifications", icon: Bell });
  }
  groups.push({ items: main });

  // Visitors
  const visitors: NavItem[] = [
    { label: "Visitors", href: "/visitors", icon: Users },
  ];
  if (canAccessCheckin(user)) {
    visitors.push({ label: "Check-in", href: "/checkin", icon: QrCode });
  }
  if (canAccessWalkin(user)) {
    visitors.push({ label: "Walk-in", href: "/checkin/walkin", icon: UserPlus });
  }
  if (!isGuardOnly) {
    visitors.push({ label: "Blacklist", href: "/blacklist", icon: ShieldBan });
  }
  groups.push({ label: "Visitors", items: visitors });

  // Guard
  if (!isGuardOnly && canAccessGuardPage(user)) {
    groups.push({
      label: "Security",
      items: [{ label: "Guard", href: "/guard", icon: Shield }],
    });
  }

  // Society management
  if (canAccessSocietyManagement(user)) {
    const society: NavItem[] = [
      { label: "Management", href: "/admin/users", icon: UserCog },
      { label: "Buildings", href: "/admin/buildings", icon: Building2 },
      { label: "Amenities", href: "/admin/amenities", icon: Dumbbell },
      { label: "Staff", href: "/admin/staff", icon: Users },
      { label: "Complaints", href: "/admin/complaints", icon: MessageSquare },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ];
    if (canAccessMeetingsAI(user)) {
      society.push({ label: "Meeting Details", href: "/admin/meetings", icon: Brain });
    }
    society.push({ label: "Nearby", href: "/admin/nearby-places", icon: MapPin });
    groups.push({ label: "Society", items: society });
  } else if (!isGuardOnly) {
    // Non-committee users still get Nearby (guards: hide in nav)
    groups.push({ items: [{ label: "Nearby", href: "/admin/nearby-places", icon: MapPin }] });
  }

  return groups;
}

function ThemePicker({ collapsed }: { collapsed: boolean }) {
  const { themeId, setTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`${theme.sidebar.navItem} ${theme.sidebar.navItemInactive} w-full`}
        title="Change theme"
      >
        <Palette className="w-4 h-4 shrink-0" />
        {!collapsed && <span className="flex-1 text-left">Theme</span>}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-56 bg-card border border-border rounded-lg shadow-dropdown dropdown-enter z-50 p-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-1.5">Choose theme</p>
          <div className="space-y-0.5 max-h-64 overflow-y-auto">
            {themes.map((t) => {
              const active = t.id === themeId;
              const bg = t.colors["--color-background"];
              const primary = t.colors["--color-primary"];
              const card = t.colors["--color-card"];
              return (
                <button
                  key={t.id}
                  onClick={() => { setTheme(t.id); setOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors ${
                    active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted-bg hover:text-foreground"
                  }`}
                >
                  <div className="flex gap-0.5 shrink-0">
                    <span className="w-3 h-3 rounded-full border border-border" style={{ background: bg }} />
                    <span className="w-3 h-3 rounded-full border border-border" style={{ background: primary }} />
                    <span className="w-3 h-3 rounded-full border border-border" style={{ background: card }} />
                  </div>
                  <span className="flex-1 text-left truncate">{t.name}</span>
                  {active && <Check className="w-3.5 h-3.5 shrink-0 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface AppSidebarProps {
  user: User;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function AppSidebar({ user, mobileOpen, onMobileClose }: AppSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const groups = getNavGroups(user);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    // Prevent parent routes (e.g. /checkin) from highlighting on nested routes (/checkin/walkin).
    if (href === "/checkin") return pathname === "/checkin";
    return pathname.startsWith(href);
  };

  const renderNav = (showLabels: boolean) => (
    <nav className={theme.sidebar.nav}>
      {groups.map((group, gi) => (
        <div key={gi} className={theme.sidebar.navGroup}>
          {group.label && showLabels && (
            <p className={theme.sidebar.navGroupLabel}>{group.label}</p>
          )}
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onMobileClose}
                    className={`${theme.sidebar.navItem} ${
                      active ? theme.sidebar.navItemActive : theme.sidebar.navItemInactive
                    }`}
                    title={!showLabels ? item.label : undefined}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {showLabels && <span className="flex-1">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`${theme.sidebar.root} ${
          collapsed ? theme.sidebar.rootCollapsed : theme.sidebar.rootExpanded
        }`}
      >
        {/* Header */}
        <div className={theme.sidebar.header}>
          {!collapsed ? (
            <>
              <Link href="/dashboard" className="flex items-center gap-2 flex-1">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold text-foreground">VMS</span>
              </Link>
              <button
                onClick={() => setCollapsed(true)}
                className="p-1 rounded-md hover:bg-muted-bg transition text-muted-foreground"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setCollapsed(false)}
              className="mx-auto p-1 rounded-md hover:bg-muted-bg transition text-muted-foreground"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {renderNav(!collapsed)}

        {/* Footer with theme picker */}
        <div className={theme.sidebar.footer}>
          <ThemePicker collapsed={collapsed} />
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className={theme.sidebar.overlay} onClick={onMobileClose} />
      )}

      {/* Mobile drawer */}
      <aside
        className={`${theme.sidebar.mobileDrawer} ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className={theme.sidebar.header}>
          <Link href="/dashboard" className="flex items-center gap-2 flex-1" onClick={onMobileClose}>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-foreground">VMS</span>
          </Link>
          <button
            onClick={onMobileClose}
            className="p-1 rounded-md hover:bg-muted-bg transition text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {renderNav(true)}

        <div className={theme.sidebar.footer}>
          <ThemePicker collapsed={false} />
        </div>
      </aside>
    </>
  );
}
