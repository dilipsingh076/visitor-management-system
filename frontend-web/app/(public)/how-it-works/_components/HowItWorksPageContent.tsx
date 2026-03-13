"use client";

import Image from "next/image";
import {
  FadeInUp,
  FadeInLeft,
  FadeInRight,
  GradientButton,
} from "@/components/marketing";

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
  { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, title: "Time-bound Access", description: "Set validity windows for invites" },
  { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636" /></svg>, title: "Blacklist Support", description: "Block visitors instantly" },
  { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, title: "Muster Export", description: "One-click emergency exports" },
  { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622" /></svg>, title: "DPDP Compliant", description: "Built-in consent & audit logs" },
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
      <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm mb-6">{description}</p>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <FadeInUp key={index} delay={index * 0.1}>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary text-card flex items-center justify-center font-bold text-sm">
                {step.number}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-foreground mb-0.5">{step.title}</h4>
                <p className="text-muted-foreground text-xs mb-1">{step.description}</p>
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
              <span className="text-primary-light text-xs font-medium">Simple 3-Step Process</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-card mb-4">
              How <span className="text-primary">VMS</span> works
            </h1>
            <p className="text-base text-card/80">
              From invite to check-out, VMS makes visitor management effortless.
            </p>
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
                <h3 className="font-medium text-foreground text-sm mb-0.5">{feature.title}</h3>
                <p className="text-muted-foreground text-xs">{feature.description}</p>
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
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
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
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
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
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622" />
              </svg>
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
            <h2 className="text-xl sm:text-2xl font-bold text-card mb-3">
              Ready to see it in action?
            </h2>
            <p className="text-card/80 text-sm mb-6 max-w-lg mx-auto">
              Start your free trial and experience contactless visitor management.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <GradientButton href="/register-society" size="md">
                Get Started Free
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
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
