"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthContext } from "@/features/auth";
import { Card, LinkButton, HeroIllustration } from "@/components/ui";

export function HomePageContent() {
  const { isAuthenticated: authenticated } = useAuthContext();
  const [heroImageError, setHeroImageError] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Hero with full-bleed background image - native img for reliable loading */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          {!heroImageError ? (
            <img
              src="/images/hero.jpg"
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-40"
              onError={() => setHeroImageError(true)}
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-900" aria-hidden />
        </div>
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 w-full">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 mb-8">
              <HeroIllustration className="w-12 h-12 sm:w-14 sm:h-14 text-emerald-400" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white mb-6 tracking-tight leading-[1.1]">
              Secure Visitor Management for India
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 mx-auto mb-6 leading-relaxed lg:w-3/4">
              Pre-approve guests with OTP or QR codes. Contactless check-in at the gate. Real-time dashboard for guards and residents. Built for gated societies, corporate offices, factories, and campuses — and compliant with the DPDP Act 2023.
            </p>
            <p className="text-base text-slate-400 mx-auto mb-10 lg:w-2/3">
              Fewer surprises at the gate. One system for residents, visitors, and security.
            </p>
            {authenticated ? (
              <LinkButton href="/dashboard" variant="primary" size="lg" className="inline-flex items-center gap-2 shadow-xl bg-emerald-500 hover:bg-emerald-600 text-white border-0">
                Go to Dashboard
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </LinkButton>
            ) : (
              <div className="flex flex-wrap justify-center gap-4">
                <LinkButton href="/login" variant="primary" size="lg" className="inline-flex items-center gap-2 shadow-xl bg-emerald-500 hover:bg-emerald-600 text-white border-0">
                  Get Started
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </LinkButton>
                <LinkButton href="/how-it-works" variant="secondary" size="lg" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
                  How it works
                </LinkButton>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <p className="text-center text-emerald-600 font-semibold uppercase tracking-wider text-sm mb-4">Features</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-4">Why choose VMS</h2>
        <p className="text-center text-slate-600 mx-auto mb-14 lg:w-2/3">
          Built for Indian gated societies, offices, and factories: reduce gate chaos, keep an audit trail, and stay compliant with the Digital Personal Data Protection Act.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          <Card className="p-8 lg:p-10 hover:shadow-xl hover:border-emerald-200 hover:-translate-y-1 transition-all duration-300 rounded-2xl border-2 border-slate-200 bg-white">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Pre-approval and Invite</h2>
            <p className="text-slate-600 leading-relaxed">
              Residents create invites and share a one-time OTP or QR code with guests. Optional WhatsApp delivery means visitors have the code in their pocket before they reach the gate — no more “who are you here to see?”
            </p>
          </Card>
          <Card className="p-8 lg:p-10 hover:shadow-xl hover:border-emerald-200 hover:-translate-y-1 transition-all duration-300 rounded-2xl border-2 border-slate-200 bg-white">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Contactless Check-in</h2>
            <p className="text-slate-600 leading-relaxed">
              At the gate or reception, visitors enter the OTP or scan the QR, accept consent for data use (DPDP), and check in. The host is notified instantly. Guards see a live list and can export a muster CSV for fire drills or emergencies.
            </p>
          </Card>
          <Card className="p-8 lg:p-10 hover:shadow-xl hover:border-emerald-200 hover:-translate-y-1 transition-all duration-300 rounded-2xl border-2 border-slate-200 bg-white">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">DPDP Compliant</h2>
            <p className="text-slate-600 leading-relaxed">
              We capture explicit consent at check-in, maintain immutable audit logs, and support data access and erasure requests. Designed to align with the DPDP Act 2023 so societies and offices can deploy with confidence.
            </p>
          </Card>
        </div>

        {/* How it works */}
        <div className="mt-28 rounded-3xl bg-slate-900 text-white p-10 sm:p-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">How it works</h2>
          <p className="text-slate-400 text-center mx-auto mb-12 lg:w-2/3">From invite to check-out in four simple steps. No paper registers, no confusion at the gate.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              { step: 1, title: "Invite", desc: "Resident creates an invite and shares OTP or QR with the visitor (e.g. via WhatsApp)." },
              { step: 2, title: "Arrive", desc: "Visitor arrives at the society gate, office reception, or factory entrance." },
              { step: 3, title: "Check-in", desc: "Visitor enters OTP or scans QR, agrees to consent, and checks in. Host is notified." },
              { step: 4, title: "Check-out", desc: "When the visitor leaves, the guard marks check-out. Records stay for audit and muster." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  {step}
                </div>
                <h3 className="font-semibold text-white mb-1">{title}</h3>
                <p className="text-sm text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12 flex flex-wrap justify-center gap-8">
            <Link href="/how-it-works" className="text-emerald-400 font-medium hover:text-emerald-300 transition">
              Learn more
            </Link>
            <Link href="/features" className="text-emerald-400 font-medium hover:text-emerald-300 transition">
              Features
            </Link>
            <Link href="/use-cases" className="text-emerald-400 font-medium hover:text-emerald-300 transition">
              Use Cases
            </Link>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: "DPDP", sub: "Compliant" },
            { label: "Contactless", sub: "QR and OTP" },
            { label: "Real-time", sub: "Live updates" },
            { label: "India", sub: "Optimized" },
          ].map(({ label, sub }) => (
            <div key={label} className="p-6 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-200 hover:shadow-lg transition text-center">
              <p className="text-xl sm:text-2xl font-bold text-emerald-600">{label}</p>
              <p className="text-xs text-slate-500 mt-1">{sub}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
