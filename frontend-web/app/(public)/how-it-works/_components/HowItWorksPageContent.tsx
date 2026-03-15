"use client";

import Image from "next/image";
import { Clock, Ban, FileText, ShieldCheck, ArrowRight, Home, User, Shield } from "lucide-react";
import {
  FadeInUp,
  FadeInLeft,
  FadeInRight,
  GradientButton,
} from "@/components/marketing";
import { Text } from "@/components/ui";

const residentSteps = [
  { number: "01", title: "Create Invite", description: "Enter visitor name, phone, and expected arrival time.", highlight: "OTP/QR generated automatically" },
  { number: "02", title: "Share Code", description: "Share via WhatsApp, SMS, or email.", highlight: "One-tap WhatsApp sharing" },
  { number: "03", title: "Get Notified", description: "Receive instant notification when visitor checks in.", highlight: "Real-time push notifications" },
];

const visitorSteps = [
  { number: "01", title: "Receive Code", description: "Get OTP or QR code from your host before arrival.", highlight: "No app download required" },
  { number: "02", title: "Check In", description: "Enter OTP or scan QR at gate. Accept consent prompt.", highlight: "Contactless — no shared devices" },
  { number: "03", title: "Enter", description: "Guard verifies entry. Host is notified of arrival.", highlight: "Check-in in under 30 seconds" },
];

const guardSteps = [
  { number: "01", title: "View Dashboard", description: "See expected visitors, walk-ins, and checked-in guests.", highlight: "Auto-refreshing real-time view" },
  { number: "02", title: "Verify Entry", description: "Verify OTP or QR code matches the expected guest.", highlight: "Instant verification" },
  { number: "03", title: "Register Walk-ins", description: "Register walk-ins and assign residents for approval.", highlight: "Digital walk-in registration" },
];

const features = [
  { icon: <Clock className="w-5 h-5" />, title: "Time-bound Access", description: "Set validity windows for invites" },
  { icon: <Ban className="w-5 h-5" />, title: "Blacklist Support", description: "Block visitors instantly" },
  { icon: <FileText className="w-5 h-5" />, title: "Muster Export", description: "One-click emergency exports" },
  { icon: <ShieldCheck className="w-5 h-5" />, title: "DPDP Compliant", description: "Built-in consent & audit logs" },
];

interface FlowSectionProps {
  title: string;
  description: string;
  steps: typeof residentSteps;
  imagePosition: "left" | "right";
  imageSrc: string;
  imageAlt: string;
  badgeText: string;
  badgeIcon: React.ReactNode;
  badgeColor: string;
}

function FlowSection({ title, description, steps, imagePosition, imageSrc, imageAlt, badgeText, badgeIcon, badgeColor }: FlowSectionProps) {
  const ImageComponent = (
    <div className="relative h-64 lg:h-80 rounded-xl overflow-hidden shadow-lg">
      <Image src={imageSrc} alt={imageAlt} fill className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
    </div>
  );

  const ContentComponent = (
    <div>
      <Text variant="h3" as="h3" className="mb-2">{title}</Text>
      <Text variant="muted" className="mb-6">{description}</Text>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <FadeInUp key={index} delay={index * 0.1}>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary text-card flex items-center justify-center font-bold text-sm">
                {step.number}
              </div>
              <div className="flex-1">
                <Text variant="h4" as="h4" className="mb-0.5">{step.title}</Text>
                <Text variant="caption" className="mb-1">{step.description}</Text>
                <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded">
                  {step.highlight}
                </span>
              </div>
            </div>
          </FadeInUp>
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid lg:grid-cols-2 gap-10 items-center">
      {imagePosition === "left" ? (
        <>
          <FadeInLeft>{ImageComponent}</FadeInLeft>
          <FadeInRight>{ContentComponent}</FadeInRight>
        </>
      ) : (
        <>
          <FadeInLeft className="lg:order-2">{ImageComponent}</FadeInLeft>
          <FadeInRight className="lg:order-1">{ContentComponent}</FadeInRight>
        </>
      )}
    </div>
  );
}

export function HowItWorksPageContent() {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative py-16 bg-foreground overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/website/qr-scan.jpg" alt="QR scanning" fill className="object-cover opacity-15" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeInUp className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/20 rounded-full border border-primary/30 mb-4">
              <span className="text-primary-light text-xs font-medium">Simple workflow</span>
            </div>
            <Text variant="h1" as="h1" className="text-card mb-4">How <span className="text-primary">VMS</span> works for everyone</Text>
            <Text variant="body" className="text-base text-card/80">
              Residents invite. Visitors check in with OTP or QR. Guards verify. One flow, three perspectives—no paper, no confusion.
            </Text>
          </FadeInUp>
        </div>
      </section>

      {/* Quick Features */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {features.map((feature, index) => (
            <FadeInUp key={index} delay={index * 0.05}>
              <div className="bg-card p-4 rounded-xl shadow-md border border-border text-center">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
                  {feature.icon}
                </div>
                <Text variant="h3" as="h3" className="text-sm mb-0.5">{feature.title}</Text>
                <Text variant="caption">{feature.description}</Text>
              </div>
            </FadeInUp>
          ))}
        </div>
      </section>

      {/* Resident Flow */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
              <Home className="w-4 h-4" />
              For Residents
            </span>
          </FadeInUp>

          <FlowSection
            title="Invite your visitors easily"
            description="Create digital invites from your app. Share via WhatsApp in one tap."
            steps={residentSteps}
            imagePosition="left"
            imageSrc="/images/website/mobile-app.jpg"
            imageAlt="Mobile app"
            badgeText="For Residents"
            badgeIcon={null}
            badgeColor="emerald"
          />
        </div>
      </section>

      {/* Visitor Flow */}
      <section className="py-16 bg-muted-bg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-info/10 text-info rounded-full text-xs font-medium">
              <User className="w-4 h-4" />
              For Visitors
            </span>
          </FadeInUp>

          <FlowSection
            title="Seamless check-in experience"
            description="Receive your code before arrival. Check in with OTP or QR at the gate."
            steps={visitorSteps}
            imagePosition="right"
            imageSrc="/images/website/reception.jpg"
            imageAlt="Reception"
            badgeText="For Visitors"
            badgeIcon={null}
            badgeColor="blue"
          />
        </div>
      </section>

      {/* Guard Flow */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-warning/10 text-warning rounded-full text-xs font-medium">
              <Shield className="w-4 h-4" />
              For Security Guards
            </span>
          </FadeInUp>

          <FlowSection
            title="Manage all visitors in one place"
            description="Real-time dashboard shows expected, arrived, and pending visitors."
            steps={guardSteps}
            imagePosition="left"
            imageSrc="/images/website/security.jpg"
            imageAlt="Security guard"
            badgeText="For Guards"
            badgeIcon={null}
            badgeColor="purple"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-foreground relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/website/building-modern.jpg" alt="Modern building" fill className="object-cover opacity-10" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <FadeInUp>
            <Text variant="h2" as="h2" className="text-card mb-3">See it in action with a free trial</Text>
            <Text variant="body" as="p" className="text-card/80 text-sm mb-6 max-w-lg mx-auto">
              Set up in minutes. Invite a test visitor, check in with OTP or QR, and explore the dashboard.
            </Text>
            <div className="flex flex-wrap justify-center gap-3">
              <GradientButton href="/register-society" size="md">
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </GradientButton>
              <GradientButton href="/contact" variant="secondary" size="md">
                Schedule Demo
              </GradientButton>
            </div>
          </FadeInUp>
        </div>
      </section>
    </div>
  );
}
