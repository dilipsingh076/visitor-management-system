"use client";

import Link from "next/link";
import { isAuthenticated } from "@/lib/auth";
import { Card, LinkButton, HeroIllustration } from "@/components/ui";

export default function Home() {
  const authenticated = isAuthenticated();

  return (
    <div className="min-h-screen">
      {/* Hero with illustration and subtle gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-muted/40 via-background to-background pointer-events-none" aria-hidden />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative">
          <div className="text-center mb-14">
            <div className="inline-block text-primary mb-6">
              <HeroIllustration className="w-40 h-40 sm:w-52 sm:h-52 mx-auto" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Secure Visitor Management for India
            </h1>
            <p className="text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
              Contactless check-in, pre-approval, and real-time tracking for gated societies, offices, and factories. Simple and DPDP compliant.
            </p>
          {authenticated ? (
            <LinkButton href="/dashboard" variant="primary" size="lg" className="inline-flex items-center gap-2">
              Go to Dashboard
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </LinkButton>
          ) : (
            <div className="flex flex-wrap justify-center gap-4">
              <LinkButton href="/login" variant="primary" size="lg" className="inline-flex items-center gap-2">
                Get Started
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </LinkButton>
              <LinkButton href="/how-it-works" variant="secondary" size="lg">
                How it works
              </LinkButton>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <Card className="p-8 hover:shadow-lg hover:border-primary/30 transition-all duration-200 rounded-2xl border-2 border-transparent hover:border-primary/20">
            <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center mb-5 shadow-sm">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Pre-approval & Invite</h2>
            <p className="text-muted">
              Residents invite visitors with QR codes and OTP. Optional WhatsApp integration for instant delivery.
            </p>
          </Card>
          <Card className="p-8 hover:shadow-lg hover:border-success/30 transition-all duration-200 rounded-2xl border-2 border-transparent hover:border-success/20">
            <div className="w-14 h-14 rounded-2xl bg-success-light flex items-center justify-center mb-5 shadow-sm">
              <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Contactless Check-in</h2>
            <p className="text-muted">
              QR scan or OTP-based check-in. Host notifications, muster export, and real-time dashboard.
            </p>
          </Card>
          <Card className="p-8 hover:shadow-lg hover:border-warning/30 transition-all duration-200 rounded-2xl border-2 border-transparent hover:border-warning/20">
            <div className="w-14 h-14 rounded-2xl bg-warning-light flex items-center justify-center mb-5 shadow-sm">
              <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">DPDP Compliant</h2>
            <p className="text-muted">
              Explicit consent capture, immutable audit logs, and data erasure support for DPDP Act 2023.
            </p>
          </Card>
        </div>

        <div className="bg-primary-muted/30 rounded-2xl border border-primary/10 p-10 shadow-sm">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center mx-auto mb-3 font-bold text-lg shadow-md">1</div>
              <h3 className="font-semibold text-foreground mb-1">Invite</h3>
              <p className="text-sm text-muted">Resident invites visitor with OTP/QR</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center mx-auto mb-3 font-bold text-lg shadow-md">2</div>
              <h3 className="font-semibold text-foreground mb-1">Arrive</h3>
              <p className="text-sm text-muted">Visitor arrives at gate</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center mx-auto mb-3 font-bold text-lg shadow-md">3</div>
              <h3 className="font-semibold text-foreground mb-1">Check-in</h3>
              <p className="text-sm text-muted">Scan QR or enter OTP + consent</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center mx-auto mb-3 font-bold text-lg shadow-md">4</div>
              <h3 className="font-semibold text-foreground mb-1">Check-out</h3>
              <p className="text-sm text-muted">Guard checks out when visitor leaves</p>
            </div>
          </div>
          <div className="text-center mt-6 flex justify-center gap-6">
            <Link href="/how-it-works" className="text-primary font-medium hover:underline">
              Learn more →
            </Link>
            <Link href="/features" className="text-primary font-medium hover:underline">
              Features
            </Link>
            <Link href="/use-cases" className="text-primary font-medium hover:underline">
              Use Cases
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 rounded-2xl bg-card border border-border hover:shadow-md transition">
            <p className="text-2xl font-bold text-primary">DPDP</p>
            <p className="text-xs text-muted mt-1">Compliant</p>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border hover:shadow-md transition">
            <p className="text-2xl font-bold text-success">Contactless</p>
            <p className="text-xs text-muted mt-1">QR & OTP</p>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border hover:shadow-md transition">
            <p className="text-2xl font-bold text-warning">Real-time</p>
            <p className="text-xs text-muted mt-1">Live updates</p>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border hover:shadow-md transition">
            <p className="text-2xl font-bold text-foreground">India</p>
            <p className="text-xs text-muted mt-1">Optimized</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
