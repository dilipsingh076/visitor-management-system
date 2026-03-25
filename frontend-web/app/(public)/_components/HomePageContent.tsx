"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  QrCode,
  ShieldCheck,
  ArrowRight,
  Play,
  Check,
  LayoutDashboard,
  Megaphone,
  Mic,
  Home,
  MapPin,
  Building2,
} from "lucide-react";
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
  {
    icon: <Mail className="h-6 w-6" />,
    title: "Invites & digital passes",
    description:
      "Residents create invites with OTP, QR, or shareable links—optionally tied to building and flat in multi-tower societies.",
  },
  {
    icon: <QrCode className="h-6 w-6" />,
    title: "Contactless check-in",
    description:
      "Visitors check in at the gate with OTP or QR and explicit DPDP consent. Hosts get instant in-app notifications.",
  },
  {
    icon: <LayoutDashboard className="h-6 w-6" />,
    title: "Guard desk & walk-ins",
    description:
      "One screen for pending approvals, checked-in guests, and walk-ins. Guards register arrivals and residents approve from their phone.",
  },
  {
    icon: <Megaphone className="h-6 w-6" />,
    title: "Society notices",
    description:
      "Committee publishes announcements to every resident. Optional AI-assisted drafting when your deployment includes AI.",
  },
  {
    icon: <Mic className="h-6 w-6" />,
    title: "Meetings AI",
    description:
      "Upload or record audio, get transcripts and summaries, and ask questions across your society’s meeting history.",
  },
  {
    icon: <Home className="h-6 w-6" />,
    title: "My flat & household",
    description:
      "Residents manage household members, complaints, and maintenance visibility—aligned with how your society is set up.",
  },
  {
    icon: <MapPin className="h-6 w-6" />,
    title: "Nearby places",
    description:
      "Help residents find pharmacies, ATMs, hospitals, and more near the society when location search is enabled.",
  },
  {
    icon: <Building2 className="h-6 w-6" />,
    title: "Buildings, amenities & staff",
    description:
      "Admins configure towers and flats, amenities, maintenance staff, and society rules from a single admin workspace.",
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: "Blacklist, muster & audit",
    description:
      "Block unwanted visitors, export who is on premises for drills, and rely on role-based access with consent-aware flows.",
  },
];

const testimonials = [
  {
    quote:
      "Walk-ins and OTP check-in replaced paper registers. We now publish society notices from the same system, and the committee uses meeting transcripts instead of scattered notes.",
    author: "Rajesh Sharma",
    role: "Chairman",
    company: "Green Valley Society, Pune",
  },
  {
    quote:
      "Guards see who is expected and who is inside. Residents use My Flat for complaints and nearby places for new staff—we finally have one portal instead of five WhatsApp groups.",
    author: "Priya Menon",
    role: "Secretary",
    company: "Palm Heights, Bangalore",
  },
  {
    quote:
      "Consent at check-in and muster exports for drills satisfied our DPDP review. Office reception uses the same visitor flow we piloted at our society gate.",
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
    description:
      "Residents, flats, committees, notices, gate desk, and walk-ins—one stack for Indian apartment complexes.",
    image: "/images/website/apartment-building.jpg",
  },
  {
    title: "Corporate Offices",
    description:
      "Visitor passes, reception check-in, audit-friendly logs, and optional multi-location rollouts.",
    image: "/images/website/office-lobby.jpg",
  },
  {
    title: "Industrial Facilities",
    description:
      "Contractor time windows, muster exports, and clear visibility of who is on site during shifts.",
    image: "/images/website/factory.jpg",
  },
];

const steps = [
  { number: "01", title: "Invite", description: "Resident creates invite with OTP, QR, or link" },
  { number: "02", title: "Share", description: "Code shared via WhatsApp, SMS, or in person" },
  { number: "03", title: "Check-in", description: "Visitor enters OTP or scans QR; consent captured" },
  { number: "04", title: "Notify", description: "Host and guards see status in real time" },
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
                <Text variant="hero" as="h1" inverse className="mb-4 max-w-lg mx-auto lg:mx-0">
                  No more paper registers.{" "}
                  <span className="text-primary">Visitor management that actually works.</span>
                </Text>
              </FadeInUp>

              <FadeInUp delay={0.15}>
                <Text variant="body" inverse className="text-base mb-6 max-w-lg mx-auto lg:mx-0">
                  Residents invite guests with a tap. Visitors check in with OTP or QR at the gate. Guards and committees use one
                  dashboard for walk-ins, notices, and meetings—while residents manage flats, complaints, and nearby services.
                  Built for Indian societies, offices, and factories—with DPDP-aligned consent and audit trails.
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
                  <TrustBadge inverse label="Free Setup" />
                  <TrustBadge inverse label="No Credit Card" />
                  <TrustBadge inverse label="Cancel Anytime" />
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
                      <Text variant="body" inverse className="font-medium text-sm">
                        Visitor Checked In
                      </Text>
                      <Text variant="caption" inverse>
                        Just now
                      </Text>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-3 -right-3 bg-card/10 backdrop-blur-sm border border-card/20 px-3 py-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-card">24</span>
                    <span className="text-xs text-card/80">Visitors<br />Today</span>
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
              Paper registers are illegible, unsearchable, and useless in an emergency. Guards waste time calling residents,
              and committee updates live in random chats. VMS brings invites, gate desk, notices, meetings, flats, and
              nearby services into one place—with consent-aware check-in and muster when you need it.
            </Text>
          </FadeInUp>
          <div className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <FadeInUp delay={0.05}>
              <div className="bg-muted-bg rounded-xl p-4 text-center">
                <Text variant="label" className="mb-1">For residents</Text>
                <Text variant="caption">Invite once, track status, and use My Flat for complaints and household updates.</Text>
              </div>
            </FadeInUp>
            <FadeInUp delay={0.1}>
              <div className="bg-muted-bg rounded-xl p-4 text-center">
                <Text variant="label" className="mb-1">For guards</Text>
                <Text variant="caption">Pending, approved, and on-site lists in one view—plus walk-ins routed to residents.</Text>
              </div>
            </FadeInUp>
            <FadeInUp delay={0.15}>
              <div className="bg-muted-bg rounded-xl p-4 text-center">
                <Text variant="label" className="mb-1">For admins</Text>
                <Text variant="caption">Notices, buildings, amenities, staff, and exports for audits and emergencies.</Text>
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
              title={<>Everything in <span className="text-primary">one workspace</span></>}
              description="Visitors, gate operations, society communications, meetings, flats, amenities, and nearby services—aligned with how your society or workplace is actually run."
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
                    <Text variant="h4" as="h3" inverse className="text-base mb-1">
                      {step.title}
                    </Text>
                    <Text variant="muted" inverse className="text-sm">
                      {step.description}
                    </Text>
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
                    <Text variant="h3" as="h3" inverse className="text-lg mb-1">
                      {useCase.title}
                    </Text>
                    <Text variant="muted" inverse className="text-sm">
                      {useCase.description}
                    </Text>
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
            <Text variant="h2" as="h2" inverse className="mb-4">
              Ready to replace paper registers with <span className="text-primary">contactless check-in</span>?
            </Text>
            <Text variant="body" inverse className="text-base mb-6">
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
            <Text variant="caption" inverse className="mt-4 opacity-80">
              Free setup • 14-day trial • DPDP compliant • Cancel anytime
            </Text>
          </FadeInUp>
        </div>
      </section>
    </div>
  );
}
