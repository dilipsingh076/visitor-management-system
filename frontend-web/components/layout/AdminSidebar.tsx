"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  MessageSquare,
  HelpCircle,
  FileText,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  Shield,
  LogOut,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { removeToken } from "@/lib/auth";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/platform", icon: LayoutDashboard },
  { label: "Societies", href: "/platform/societies", icon: Building2 },
  { label: "Users", href: "/platform/users", icon: Users },
  { label: "Subscriptions", href: "/platform/subscriptions", icon: CreditCard },
  { label: "Complaints", href: "/platform/complaints", icon: MessageSquare },
  { label: "Support", href: "/platform/support", icon: HelpCircle },
  { label: "Audit Logs", href: "/platform/audit-logs", icon: FileText },
  { label: "Announcements", href: "/platform/announcements", icon: Bell },
  { label: "Settings", href: "/platform/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === "/platform") {
      return pathname === "/platform";
    }
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    removeToken();
    window.location.href = "/login";
  };

  return (
    <aside
      className={`hidden md:flex flex-col bg-card border-r border-border transition-all duration-200 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-3 border-b border-border">
        {!collapsed && (
          <Link href="/platform" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-4 h-4 text-card" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground leading-tight">VMS</span>
              <span className="text-[10px] text-muted-foreground leading-tight">Platform Admin</span>
            </div>
          </Link>
        )}
        {collapsed && (
          <Link href="/platform" className="mx-auto">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-4 h-4 text-card" />
            </div>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1 rounded-md hover:bg-muted-bg transition text-muted-foreground ${collapsed ? "hidden" : ""}`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        <ul className="space-y-0.5 px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted-bg hover:text-foreground"
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-1.5 py-0.5 text-xs bg-error text-card rounded-full min-w-[18px] text-center">
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-border">
        {collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            className="w-full p-2 rounded-lg hover:bg-muted-bg transition text-muted-foreground flex items-center justify-center"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted-bg hover:text-foreground transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        )}
      </div>
    </aside>
  );
}
