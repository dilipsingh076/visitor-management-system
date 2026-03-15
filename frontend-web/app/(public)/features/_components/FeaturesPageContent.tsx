"use client";

import Image from "next/image";
import { Mail, QrCode, User, BarChart3, Ban, FileText, Bell, Clock, ShieldCheck, ArrowRight, Check } from "lucide-react";
import {
  FadeInUp,
  FadeInLeft,
  FadeInRight,
  FeatureCard,
  SectionHeading,
  GradientButton,
  MobileComingSoon,
} from "@/components/marketing";
import { Text } from "@/components/ui";

const features = [
  { title: "Pre-approval and Invitations", description: "Residents create visitor invites with OTP or QR codes. Share via WhatsApp instantly.", icon: <Mail className="w-6 h-6" /> },
  { title: "Contactless Check-in", description: "Visitors enter OTP or scan QR at gate, accept consent, and check in. Host notified immediately.", icon: <QrCode className="w-6 h-6" /> },
  { title: "Guard Walk-in Registration", description: "Guards can register walk-ins and assign residents. Instant approval notification.", icon: <User className="w-6 h-6" /> },
  { title: "Real-time Dashboard", description: "Guards and admins see pending, approved, and checked-in visitors in real-time.", icon: <BarChart3 className="w-6 h-6" /> },
  { title: "Blacklist Management", description: "Block specific visitors by phone or identity. Prevent unwanted entries instantly.", icon: <Ban className="w-6 h-6" /> },
  { title: "Muster Export", description: "Download CSV of everyone on premises. Essential for fire drills and emergencies.", icon: <FileText className="w-6 h-6" /> },
  { title: "Host Notifications", description: "Residents get alerts when visitors check in. No more calls to the guard.", icon: <Bell className="w-6 h-6" /> },
  { title: "Time Validity", description: "Invites with expected arrival window and configurable buffer for flexibility.", icon: <Clock className="w-6 h-6" /> },
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
            <Text variant="h1" as="h1" className="text-card mb-4">
              One platform for <span className="text-primary">invites, check-in, and compliance</span>
            </Text>
            <Text variant="body" className="text-base text-card/80">
              From digital invites and OTP/QR check-in to real-time dashboards, blacklist, muster export, and DPDP-ready consent. Built for Indian societies, offices, and factories.
            </Text>
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
                  <Text variant="h4" as="p" className="text-card mb-1">Contactless Check-in</Text>
                  <Text variant="bodySmall" as="p" className="text-card/90">OTP or QR — no shared devices</Text>
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
                  <Text variant="h4" as="p" className="text-card mb-1">Real-time Dashboard</Text>
                  <Text variant="bodySmall" as="p" className="text-card/90">Live visitor tracking for guards</Text>
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

      {/* Mobile app — coming soon */}
      <MobileComingSoon />

      {/* Compliance Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <FadeInLeft>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full mb-4">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="text-primary text-xs font-medium">DPDP Act 2023 Compliant</span>
              </div>
              <Text variant="h2" as="h2" className="mb-4">Built for Indian Data Protection Laws</Text>
              <Text variant="muted" className="mb-6">
                VMS is designed from the ground up to align with the Digital Personal Data Protection Act 2023. 
                We handle consent, audit logs, and data requests so you can deploy with confidence.
              </Text>
              <ul className="space-y-3">
                {complianceFeatures.map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
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
                      <ShieldCheck className="w-5 h-5 text-card" />
                    </div>
                    <div>
                      <Text variant="label" className="text-foreground text-sm mb-0">100% Compliant</Text>
                      <Text variant="caption">DPDP Act 2023</Text>
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
            <Text variant="h2" as="h2" className="text-card mb-3">Get the full feature set with a free trial</Text>
            <Text variant="body" as="p" className="text-card/80 text-sm mb-6 max-w-lg mx-auto">
              No credit card required. Set up in minutes and see why societies and offices choose VMS.
            </Text>
            <div className="flex flex-wrap justify-center gap-3">
              <GradientButton href="/register-society" variant="outline" size="md" className="bg-card text-primary border-card hover:bg-card/90">
                Get Started Free
                <ArrowRight className="w-4 h-4" />
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
