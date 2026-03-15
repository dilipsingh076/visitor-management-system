"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, QrCode, ShieldCheck, BarChart3, Ban, FileText, ArrowRight, Play, Check } from "lucide-react";
import { useAuthContext } from "@/features/auth";
import {
  FadeInUp,
  AnimatedCounter,
  FeatureCard,
  SectionHeading,
  TrustBadge,
  TestimonialCard,
  GradientButton,
  MobileComingSoon,
} from "@/components/marketing";
import { Text } from "@/components/ui";

const features = [
  { icon: <Mail className="w-6 h-6" />, title: "Pre-approval & Invites", description: "Residents create visitor invites with OTP or QR codes. Share via WhatsApp instantly." },
  { icon: <QrCode className="w-6 h-6" />, title: "Contactless Check-in", description: "Visitors enter OTP or scan QR at gate. Host gets instant notification." },
  { icon: <ShieldCheck className="w-6 h-6" />, title: "DPDP Act Compliant", description: "Explicit consent capture, audit logs, and data access/erasure support." },
  { icon: <BarChart3 className="w-6 h-6" />, title: "Real-time Dashboard", description: "Guards see live visitor counts. Admins get analytics with auto-refresh." },
  { icon: <Ban className="w-6 h-6" />, title: "Blacklist Management", description: "Block specific visitors instantly. Prevent unwanted entries." },
  { icon: <FileText className="w-6 h-6" />, title: "Muster Export", description: "One-click CSV export. Essential for fire drills and emergencies." },
];

const testimonials = [
  {
    quote: "We went from illegible paper registers and guards calling 50 flats a day to OTP check-in. Residents love it; our committee finally has a proper audit trail.",
    author: "Rajesh Sharma",
    role: "Chairman",
    company: "Green Valley Society, Pune",
  },
  {
    quote: "Delivery and repair staff check in in under 30 seconds. We see who's expected in real time. Fire drill muster is one click—no more running around with clipboards.",
    author: "Priya Menon",
    role: "Secretary",
    company: "Palm Heights, Bangalore",
  },
  {
    quote: "We needed DPDP-compliant visitor records and consent. VMS does that out of the box. Our legal team was satisfied; our reception team just uses the dashboard.",
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
    description: "Residents invite guests; guards verify OTP/QR. No more paper logs or missed callbacks.",
    image: "/images/website/society.jpg",
  },
  {
    title: "Corporate Offices",
    description: "Time-bound meeting invites, full audit trail, and a professional reception experience.",
    image: "/images/website/office-lobby.jpg",
  },
  {
    title: "Industrial Facilities",
    description: "Contractor access, safety compliance, and one-click muster for emergencies.",
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
                <Text variant="hero" as="h1" className="text-card mb-4 max-w-lg mx-auto lg:mx-0">
                  No more paper registers.{" "}
                  <span className="text-primary">Visitor management that actually works.</span>
                </Text>
              </FadeInUp>

              <FadeInUp delay={0.15}>
                <Text variant="body" className="text-base text-card/80 mb-6 max-w-lg mx-auto lg:mx-0">
                  Residents invite guests with a tap. Visitors check in with OTP or QR at the gate. Guards see who’s expected in real time. 
                  Built for Indian societies, offices, and factories—and fully compliant with the DPDP Act 2023.
                </Text>
              </FadeInUp>

              <FadeInUp delay={0.2}>
                {showDashboardCta ? (
                  <GradientButton href="/dashboard" size="md">
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </GradientButton>
                ) : (
                  <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                    <GradientButton href="/register-society" size="md">
                      Start Free Trial
                      <ArrowRight className="w-4 h-4" />
                    </GradientButton>
                    <GradientButton href="/how-it-works" variant="secondary" size="md">
                      <Play className="w-4 h-4" />
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
                      <Check className="w-4 h-4 text-card" />
                    </div>
                    <div>
                      <Text variant="body" className="text-card font-medium text-sm">Visitor Checked In</Text>
                      <Text variant="caption" className="text-card/60">Just now</Text>
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

      {/* Problem we solve — scannable value */}
      <section className="py-14 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp className="max-w-3xl mx-auto text-center mb-10">
            <Text variant="h2" as="h2" className="mb-3">The problem we solve</Text>
            <Text variant="muted" className="text-sm">
              Paper registers are illegible, unsearchable, and useless in an emergency. Guards waste time calling residents. 
              Visitors queue at peak hours. There’s no record of who’s on premises. VMS fixes this with one platform: 
              digital invites, contactless check-in, and real-time visibility for everyone.
            </Text>
          </FadeInUp>
          <div className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <FadeInUp delay={0.05}>
              <div className="bg-muted-bg rounded-xl p-4 text-center">
                <Text variant="label" className="mb-1">For residents</Text>
                <Text variant="caption">Invite once, get notified when guests arrive. No more calls to the guard.</Text>
              </div>
            </FadeInUp>
            <FadeInUp delay={0.1}>
              <div className="bg-muted-bg rounded-xl p-4 text-center">
                <Text variant="label" className="mb-1">For guards</Text>
                <Text variant="caption">See expected visitors and walk-ins in one dashboard. Verify OTP/QR in seconds.</Text>
              </div>
            </FadeInUp>
            <FadeInUp delay={0.15}>
              <div className="bg-muted-bg rounded-xl p-4 text-center">
                <Text variant="label" className="mb-1">For admins</Text>
                <Text variant="caption">Audit trail, muster export for drills, blacklist, and DPDP-ready consent.</Text>
              </div>
            </FadeInUp>
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
              description="One platform for invites, check-in, real-time dashboard, blacklist, and emergency muster. Built for Indian gated societies, offices, and factories."
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
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </FadeInUp>
        </div>
      </section>

      {/* Mobile app — coming soon */}
      <MobileComingSoon />

      {/* How it Works Section */}
      <section className="py-16 bg-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <SectionHeading
              eyebrow="How it works"
              title={<>From invite to check-out in <span className="text-primary">4 simple steps</span></>}
              description="Residents invite, visitors check in with OTP or QR, guards verify, and everyone stays in sync. No paper, no phone tag."
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
                    <Text variant="h4" as="h3" className="text-card text-base mb-1">{step.title}</Text>
                    <Text variant="muted" className="text-card/70 text-sm">{step.description}</Text>
                  </div>
                </div>
              </FadeInUp>
            ))}
          </div>

          <FadeInUp delay={0.4} className="text-center mt-8">
            <GradientButton href="/how-it-works" variant="secondary" size="sm">
              Learn more
              <ArrowRight className="w-4 h-4" />
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
                    <Text variant="h3" as="h3" className="text-card text-lg mb-1">{useCase.title}</Text>
                    <Text variant="muted" className="text-card/80 text-sm">{useCase.description}</Text>
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
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
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
              title={<>Trusted by <span className="text-primary">societies and offices</span></>}
              description="Real feedback from chairmen, secretaries, and admin teams who switched to VMS."
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
            <Text variant="h2" as="h2" className="text-card mb-4">
              Ready to replace paper registers with <span className="text-primary">contactless check-in</span>?
            </Text>
            <Text variant="body" className="text-base text-card/80 mb-6">
              Join hundreds of societies and offices across India. Start your free trial in minutes—no credit card required.
            </Text>
            <div className="flex flex-wrap justify-center gap-3">
              <GradientButton href="/register-society" size="md">
                Start free trial
                <ArrowRight className="w-4 h-4" />
              </GradientButton>
              <GradientButton href="/contact" variant="secondary" size="md">
                Talk to sales
              </GradientButton>
            </div>
            <Text variant="caption" className="text-card/50 mt-4">
              Free setup • 14-day trial • DPDP compliant • Cancel anytime
            </Text>
          </FadeInUp>
        </div>
      </section>
    </div>
  );
}
