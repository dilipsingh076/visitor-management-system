"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthContext } from "@/features/auth";
import { removeToken, getPrimaryRole, ROLE_LABELS } from "@/lib/auth";
import {
  Menu,
  Search,
  Bell,
  User,
  LogOut,
  Settings,
  HelpCircle,
  ChevronDown,
} from "lucide-react";

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { user } = useAuthContext();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const handleLogout = () => {
    removeToken();
    window.location.href = "/login";
  };

  const roleLabel = user ? ROLE_LABELS[getPrimaryRole(user)] || getPrimaryRole(user) : "";

  return (
    <header className="h-14 bg-card border-b border-border px-4 flex items-center justify-between shrink-0">
      {/* Left: Mobile menu + Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-muted-bg transition md:hidden"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>

        {/* Search */}
        <div className="hidden sm:flex items-center">
          {showSearch ? (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                autoFocus
                onBlur={() => setShowSearch(false)}
                className="w-64 pl-9 pr-3 py-1.5 text-sm bg-muted-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted-bg rounded-lg hover:bg-muted-bg/80 transition"
            >
              <Search className="w-4 h-4" />
              <span>Search...</span>
              <kbd className="hidden lg:inline-flex px-1.5 py-0.5 text-[10px] bg-card border border-border rounded">
                ⌘K
              </kbd>
            </button>
          )}
        </div>
      </div>

      {/* Right: Notifications + User */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-muted-bg transition">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted-bg transition"
          >
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <span className="text-card text-xs font-semibold">
                {user?.username?.charAt(0).toUpperCase() || "A"}
              </span>
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-sm font-medium text-foreground leading-tight">
                {user?.username || "Admin"}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight">
                {roleLabel}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-1 w-48 bg-card rounded-lg shadow-lg border border-border z-20 py-1">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user?.email || "admin@vms.in"}
                  </p>
                  <p className="text-xs text-muted-foreground">{roleLabel}</p>
                </div>
                <Link
                  href="/platform/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted-bg transition"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <Link
                  href="/platform/support"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted-bg transition"
                >
                  <HelpCircle className="w-4 h-4" />
                  Help & Support
                </Link>
                <div className="border-t border-border mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-muted-bg transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
