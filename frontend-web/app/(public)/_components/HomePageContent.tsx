"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthContext } from "@/features/auth";
import {
  FadeInUp,
  AnimatedCounter,
  FeatureCard,
  SectionHeading,
  TrustBadge,
  TestimonialCard,
  GradientButton,
} from "@/components/marketing";

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: "Pre-approval & Invites",
    description: "Residents create visitor invites with OTP or QR codes. Share via WhatsApp instantly.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
    ),
    title: "Contactless Check-in",
    description: "Visitors enter OTP or scan QR at gate. Host gets instant notification.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "DPDP Act Compliant",
    description: "Explicit consent capture, audit logs, and data access/erasure support.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Real-time Dashboard",
    description: "Guards see live visitor counts. Admins get analytics with auto-refresh.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
    title: "Blacklist Management",
    description: "Block specific visitors instantly. Prevent unwanted entries.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: "Muster Export",
    description: "One-click CSV export. Essential for fire drills and emergencies.",
  },
];

const testimonials = [
  {
    quote: "VMS has completely transformed how we manage visitors at our society. No more paper registers, no more confusion at the gate.",
    author: "Rajesh Sharma",
    role: "Chairman",
    company: "Green Valley Society, Pune",
  },
  {
    quote: "The OTP-based check-in is brilliant. Our delivery personnel check in within seconds. Real-time visibility of everyone on premises.",
    author: "Priya Menon",
    role: "Secretary",
    company: "Palm Heights, Bangalore",
  },
  {
    quote: "DPDP compliance was critical for us. VMS handles consent and audit logs automatically. Our reception team focuses on welcoming guests.",
    author: "Amit Desai",
    role: "Admin Manager",
    company: "TechCorp, Mumbai",
  },
];

const stats = [
  { value: 500, suffix: "+", label: "Societies" },
  { value: 50000, suffix: "+", label: "Daily Check-ins" },
  { value: 99.9, suffix: "%", label: "Uptime" },
  { value: 4.9, suffix: "/5", label: "Rating" },
];

const useCases = [
  {
    title: "Gated Societies",
    description: "Streamline visitor management for residential complexes.",
    image: "/images/website/society.jpg",
  },
  {
    title: "Corporate Offices",
    description: "Professional reception with time-bound invites.",
    image: "/images/website/office-lobby.jpg",
  },
  {
    title: "Industrial Facilities",
    description: "Contractor management and emergency muster.",
    image: "/images/website/factory.jpg",
  },
];

const steps = [
  { number: "01", title: "Invite", description: "Resident creates invite with OTP or QR" },
  { number: "02", title: "Share", description: "Code shared via WhatsApp or SMS" },
  { number: "03", title: "Check-in", description: "Visitor enters code at gate" },
  { number: "04", title: "Notify", description: "Host receives instant notification" },
];

export function HomePageContent() {
  const { isAuthenticated: authenticated } = useAuthContext();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const showDashboardCta = mounted && authenticated;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center pt-16">
        <div className="absolute inset-0">
          <Image
            src="/images/website/hero-bg.jpg"
            alt="Modern building"
            fill
            className="object-cover"
            priority
            sizes="100vw"
            quality={85}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/95 to-foreground/70" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <FadeInUp>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/20 rounded-full border border-primary/30 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-primary-light text-xs font-medium">DPDP Act 2023 Compliant</span>
                </div>
              </FadeInUp>

              <FadeInUp delay={0.1}>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-card mb-4 leading-tight">
                  Secure Visitor Management for{" "}
                  <span className="text-primary">Modern India</span>
                </h1>
              </FadeInUp>

              <FadeInUp delay={0.15}>
                <p className="text-base text-card/80 mb-6 max-w-lg mx-auto lg:mx-0">
                  Replace paper registers with contactless check-in. Pre-approve guests with OTP or QR codes. 
                  Real-time dashboard for guards and residents.
                </p>
              </FadeInUp>

              <FadeInUp delay={0.2}>
                {showDashboardCta ? (
                  <GradientButton href="/dashboard" size="md">
                    Go to Dashboard
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </GradientButton>
                ) : (
                  <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                    <GradientButton href="/register-society" size="md">
                      Start Free Trial
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </GradientButton>
                    <GradientButton href="/how-it-works" variant="secondary" size="md">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Watch Demo
                    </GradientButton>
                  </div>
                )}
              </FadeInUp>

              <FadeInUp delay={0.25}>
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-6">
                  <TrustBadge label="Free Setup" />
                  <TrustBadge label="No Credit Card" />
                  <TrustBadge label="Cancel Anytime" />
                </div>
              </FadeInUp>
            </div>

            <FadeInUp delay={0.2} className="hidden lg:block">
              <div className="relative">
                <div className="bg-card/10 backdrop-blur-sm border border-card/20 p-2 rounded-xl">
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                    <Image
                      src="/images/website/dashboard.jpg"
                      alt="VMS Dashboard"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                </div>
                
                <div className="absolute -bottom-4 -left-4 bg-card/10 backdrop-blur-sm border border-card/20 px-3 py-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <svg className="w-4 h-4 text-card" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-card font-medium text-sm">Visitor Checked In</p>
                      <p className="text-card/60 text-xs">Just now</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-3 -right-3 bg-card/10 backdrop-blur-sm border border-card/20 px-3 py-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-card">24</span>
                    <span className="text-card/70 text-xs">Visitors<br />Today</span>
                  </div>
                </div>
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-card mb-1">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm font-medium text-card/90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted-bg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <SectionHeading
              eyebrow="Features"
              title={<>Everything you need to <span className="text-primary">manage visitors</span></>}
              description="Built for Indian gated societies, offices, and factories."
              className="mb-12"
            />
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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

          <FadeInUp delay={0.3} className="text-center mt-8">
            <Link
              href="/features"
              className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:text-primary-hover transition group"
            >
              View all features
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </FadeInUp>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 bg-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <SectionHeading
              eyebrow="How it works"
              title={<>From invite to check-out in <span className="text-primary">4 simple steps</span></>}
              description="No paper registers, no confusion at the gate."
              light
              className="mb-12"
            />
          </FadeInUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <FadeInUp key={index} delay={index * 0.1}>
                <div className="relative">
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-[60%] w-full h-px bg-primary/30" />
                  )}
                  <div className="bg-card/5 backdrop-blur-sm border border-card/10 p-5 rounded-xl relative z-10">
                    <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mb-4">
                      <span className="text-lg font-bold text-card">{step.number}</span>
                    </div>
                    <h3 className="text-base font-semibold text-card mb-1">{step.title}</h3>
                    <p className="text-card/70 text-sm">{step.description}</p>
                  </div>
                </div>
              </FadeInUp>
            ))}
          </div>

          <FadeInUp delay={0.4} className="text-center mt-8">
            <GradientButton href="/how-it-works" variant="secondary" size="sm">
              Learn more
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </GradientButton>
          </FadeInUp>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <SectionHeading
              eyebrow="Use Cases"
              title={<>Built for every type of <span className="text-primary">premises</span></>}
              description="One system that scales from small societies to large campuses."
              className="mb-12"
            />
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {useCases.map((useCase, index) => (
              <FadeInUp key={index} delay={index * 0.1}>
                <div className="group relative h-64 rounded-xl overflow-hidden">
                  <Image
                    src={useCase.image}
                    alt={useCase.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-5">
                    <h3 className="text-lg font-semibold text-card mb-1">{useCase.title}</h3>
                    <p className="text-card/80 text-sm">{useCase.description}</p>
                  </div>
                </div>
              </FadeInUp>
            ))}
          </div>

          <FadeInUp delay={0.3} className="text-center mt-8">
            <Link
              href="/use-cases"
              className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:text-primary-hover transition group"
            >
              Explore all use cases
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </FadeInUp>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-muted-bg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <SectionHeading
              eyebrow="Testimonials"
              title={<>Trusted by <span className="text-primary">societies across India</span></>}
              description="See what our customers say about VMS."
              className="mb-12"
            />
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((testimonial, index) => (
              <FadeInUp key={index} delay={index * 0.1}>
                <TestimonialCard
                  quote={testimonial.quote}
                  author={testimonial.author}
                  role={testimonial.role}
                  company={testimonial.company}
                />
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-foreground relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/website/building-modern.jpg"
            alt="Modern building"
            fill
            className="object-cover opacity-10"
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeInUp className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-card mb-4">
              Ready to modernize your{" "}
              <span className="text-primary">visitor management</span>?
            </h2>
            <p className="text-base text-card/80 mb-6">
              Join 500+ societies and offices across India using VMS for secure, contactless check-ins.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <GradientButton href="/register-society" size="md">
                Get Started Free
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </GradientButton>
              <GradientButton href="/contact" variant="secondary" size="md">
                Contact Sales
              </GradientButton>
            </div>
            <p className="text-card/50 text-xs mt-4">
              No credit card required • Free 14-day trial • Cancel anytime
            </p>
          </FadeInUp>
        </div>
      </section>
    </div>
  );
}
