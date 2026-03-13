"use client";

import Image from "next/image";
import {
  FadeInUp,
  FadeInLeft,
  FadeInRight,
  FeatureCard,
  SectionHeading,
  GradientButton,
} from "@/components/marketing";

const features = [
  {
    title: "Pre-approval and Invitations",
    description: "Residents create visitor invites with OTP or QR codes. Share via WhatsApp instantly.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "Contactless Check-in",
    description: "Visitors enter OTP or scan QR at gate, accept consent, and check in. Host notified immediately.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
    ),
  },
  {
    title: "Guard Walk-in Registration",
    description: "Guards can register walk-ins and assign residents. Instant approval notification.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    title: "Real-time Dashboard",
    description: "Guards and admins see pending, approved, and checked-in visitors in real-time.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: "Blacklist Management",
    description: "Block specific visitors by phone or identity. Prevent unwanted entries instantly.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
  },
  {
    title: "Muster Export",
    description: "Download CSV of everyone on premises. Essential for fire drills and emergencies.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: "Host Notifications",
    description: "Residents get alerts when visitors check in. No more calls to the guard.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    title: "Time Validity",
    description: "Invites with expected arrival window and configurable buffer for flexibility.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const complianceFeatures = [
  "Explicit consent capture at every check-in",
  "Immutable audit logs for all visitor activity",
  "Data access and erasure request support",
  "Role-based access control for staff",
  "Secure data storage with encryption",
  "Regular security audits and updates",
];

export function FeaturesPageContent() {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative py-16 bg-foreground overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/website/reception.jpg"
            alt="Office reception"
            fill
            className="object-cover opacity-15"
            priority
            sizes="100vw"
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeInUp className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/20 rounded-full border border-primary/30 mb-4">
              <span className="text-primary-light text-xs font-medium">Complete Feature Set</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-card mb-4">
              Everything you need for <span className="text-primary">secure access</span>
            </h1>
            <p className="text-base text-card/80">
              Contactless check-in, real-time dashboard, DPDP compliance. Built for Indian societies, offices, and factories.
            </p>
          </FadeInUp>
        </div>
      </section>

      {/* Visual Banner */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid md:grid-cols-2 gap-4">
          <FadeInLeft>
            <div className="group relative h-48 rounded-xl overflow-hidden shadow-lg">
              <Image
                src="/images/website/mobile-app.jpg"
                alt="Mobile check-in"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/50 flex items-center p-6">
                <div>
                  <p className="text-card text-lg font-bold mb-1">Contactless Check-in</p>
                  <p className="text-card/90 text-sm">OTP or QR — no shared devices</p>
                </div>
              </div>
            </div>
          </FadeInLeft>
          
          <FadeInRight>
            <div className="group relative h-48 rounded-xl overflow-hidden shadow-lg">
              <Image
                src="/images/website/dashboard.jpg"
                alt="Dashboard"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-info/90 to-info/50 flex items-center p-6">
                <div>
                  <p className="text-card text-lg font-bold mb-1">Real-time Dashboard</p>
                  <p className="text-card/90 text-sm">Live visitor tracking for guards</p>
                </div>
              </div>
            </div>
          </FadeInRight>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-muted-bg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <SectionHeading
              eyebrow="Features"
              title={<>Feature <span className="text-primary">Highlights</span></>}
              description="Every feature designed for simpler, faster, more secure visitor management."
              className="mb-12"
            />
          </FadeInUp>

          <div className="grid md:grid-cols-2 gap-5">
            {features.map((feature, index) => (
              <FadeInUp key={index} delay={index * 0.05}>
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <FadeInLeft>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full mb-4">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-primary text-xs font-medium">DPDP Act 2023 Compliant</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">
                Built for Indian Data Protection Laws
              </h2>
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                VMS is designed from the ground up to align with the Digital Personal Data Protection Act 2023. 
                We handle consent, audit logs, and data requests so you can deploy with confidence.
              </p>
              <ul className="space-y-3">
                {complianceFeatures.map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-foreground text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </FadeInLeft>
            
            <FadeInRight>
              <div className="relative">
                <div className="relative h-80 rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src="/images/website/security.jpg"
                    alt="Security"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-card border border-border px-4 py-3 rounded-lg shadow-md">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <svg className="w-5 h-5 text-card" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-foreground font-medium text-sm">100% Compliant</p>
                      <p className="text-muted-foreground text-xs">DPDP Act 2023</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInRight>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInUp>
            <h2 className="text-xl sm:text-2xl font-bold text-card mb-3">
              Ready to transform your visitor management?
            </h2>
            <p className="text-card/80 text-sm mb-6 max-w-lg mx-auto">
              Start your free trial today. No credit card required.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <GradientButton href="/register-society" variant="outline" size="md" className="bg-card text-primary border-card hover:bg-card/90">
                Get Started Free
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </GradientButton>
              <GradientButton href="/use-cases" variant="secondary" size="md">
                See Use Cases
              </GradientButton>
            </div>
          </FadeInUp>
        </div>
      </section>
    </div>
  );
}
