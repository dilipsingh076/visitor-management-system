"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Features", href: "/features" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Use Cases", href: "/use-cases" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHome = pathname === "/";
  const showSolidBg = isScrolled || !isHome;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          showSolidBg
            ? "bg-card/95 backdrop-blur-md shadow-sm border-b border-border"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                  showSolidBg ? "bg-primary" : "bg-card/20 backdrop-blur-sm"
                }`}
              >
                <svg className="w-5 h-5 text-card" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className={`text-lg font-bold transition-colors ${showSolidBg ? "text-foreground" : "text-card"}`}>
                  VMS
                </span>
                <span className={`text-[10px] font-medium tracking-wide uppercase transition-colors ${showSolidBg ? "text-primary" : "text-primary-light"}`}>
                  Visitor Management
                </span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="relative px-3 py-2 group">
                  <span
                    className={`text-sm font-medium transition-colors ${
                      pathname === link.href
                        ? showSolidBg ? "text-primary" : "text-card"
                        : showSolidBg
                        ? "text-muted-foreground hover:text-foreground"
                        : "text-card/80 hover:text-card"
                    }`}
                  >
                    {link.label}
                  </span>
                  {pathname === link.href && (
                    <span className={`absolute bottom-0 left-3 right-3 h-0.5 rounded-full ${showSolidBg ? "bg-primary" : "bg-card"}`} />
                  )}
                </Link>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/login"
                className={`text-sm font-medium transition-colors ${
                  showSolidBg ? "text-muted-foreground hover:text-foreground" : "text-card/80 hover:text-card"
                }`}
              >
                Sign in
              </Link>
              <Link
                href="/register-society"
                className="px-4 py-2 bg-primary text-card text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors"
              >
                Get Started Free
              </Link>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                showSolidBg ? "text-foreground hover:bg-muted-bg" : "text-card hover:bg-card/10"
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <>
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-40 lg:hidden"
          />

          <div className="fixed top-0 right-0 bottom-0 w-72 bg-card shadow-xl z-50 lg:hidden">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <svg className="w-4 h-4 text-card" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="text-base font-bold text-foreground">VMS</span>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted-bg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-4">
                <div className="space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        pathname === link.href
                          ? "text-primary bg-primary/10"
                          : "text-foreground hover:bg-muted-bg"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </nav>

              <div className="p-4 border-t border-border space-y-2.5">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full px-4 py-2.5 text-foreground font-medium rounded-lg border border-border hover:bg-muted-bg transition-colors text-sm"
                >
                  Sign in
                </Link>
                <Link
                  href="/register-society"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full px-4 py-2.5 bg-primary text-card font-semibold rounded-lg hover:bg-primary-hover transition-colors text-sm"
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
