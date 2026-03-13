"use client";

import Image from "next/image";
import Link from "next/link";
import {
  FadeInUp,
  FadeInLeft,
  FadeInRight,
  GradientButton,
} from "@/components/marketing";

const useCases = [
  {
    id: "societies",
    title: "Gated Societies",
    tagline: "Secure residential living",
    description: "Streamline visitor management for apartment complexes and gated communities.",
    image: "/images/website/society.jpg",
    stats: [{ value: "500+", label: "Societies" }, { value: "30sec", label: "Check-in" }, { value: "98%", label: "Satisfaction" }],
    features: ["Pre-approval with OTP/QR codes", "Instant arrival notifications", "Delivery staff management", "Blacklist for unwanted visitors", "Muster export for drills", "DPDP compliant consent"],
    challenges: ["Paper registers with illegible handwriting", "Guards calling residents repeatedly", "No audit trail of entries", "Long queues at peak hours"],
  },
  {
    id: "offices",
    title: "Corporate Offices",
    tagline: "Professional visitor experience",
    description: "Create a modern reception experience with time-bound invites and audit trails.",
    image: "/images/website/office-lobby.jpg",
    stats: [{ value: "200+", label: "Offices" }, { value: "15sec", label: "Check-in" }, { value: "100%", label: "Audit" }],
    features: ["Time-bound meeting invites", "Calendar integration", "Contractor management", "Multi-location support", "Complete audit trails", "Badge printing integration"],
    challenges: ["Unprofessional reception experience", "No visibility into premises", "Compliance headaches", "Manual contractor management"],
  },
  {
    id: "factories",
    title: "Industrial Facilities",
    tagline: "Safety-first access control",
    description: "Manage contractors with safety compliance built-in and emergency muster reports.",
    image: "/images/website/factory.jpg",
    stats: [{ value: "50+", label: "Facilities" }, { value: "1-click", label: "Muster" }, { value: "Zero", label: "Paper" }],
    features: ["Contractor time-bound access", "Safety induction acknowledgment", "Emergency muster export", "PPE compliance tracking", "Shift-based access control", "Vehicle and material tracking"],
    challenges: ["Contractor overstays", "Safety compliance gaps", "Emergency headcount challenges", "Paper-based induction"],
  },
  {
    id: "schools",
    title: "Educational Institutions",
    tagline: "Child safety first",
    description: "Protect students with verified visitor check-ins and parent notifications.",
    image: "/images/website/building-modern.jpg",
    stats: [{ value: "100+", label: "Schools" }, { value: "Real-time", label: "Alerts" }, { value: "Full", label: "Compliance" }],
    features: ["Parent-verified pickups", "Staff management", "Event registration", "Emergency lockdown alerts", "Complete visit history", "Parent notifications"],
    challenges: ["Child safety concerns", "Unknown visitors on campus", "Paper visitor logs", "Event management chaos"],
  },
];

function UseCaseDetail({ useCase, isReversed }: { useCase: typeof useCases[0]; isReversed: boolean }) {
  const ImageComponent = (
    <div className="relative">
      <div className="relative h-64 lg:h-80 rounded-xl overflow-hidden shadow-lg">
        <Image src={useCase.image} alt={useCase.title} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
      </div>
      <div className="absolute -bottom-4 left-4 right-4 bg-card/95 backdrop-blur-sm rounded-lg p-4 shadow-md border border-border">
        <div className="grid grid-cols-3 gap-3 text-center">
          {useCase.stats.map((stat, i) => (
            <div key={i}>
              <div className="text-lg font-bold text-foreground">{stat.value}</div>
              <div className="text-muted-foreground text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ContentComponent = (
    <div>
      <span className="inline-block px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium mb-3">
        {useCase.tagline}
      </span>
      <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{useCase.title}</h2>
      <p className="text-muted-foreground text-sm mb-6">{useCase.description}</p>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
          <svg className="w-4 h-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Common Challenges
        </h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {useCase.challenges.map((challenge, i) => (
            <div key={i} className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <span className="w-1 h-1 rounded-full bg-error" />
              {challenge}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
          <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          How VMS Helps
        </h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {useCase.features.map((feature, i) => (
            <div key={i} className="flex items-start gap-1.5 text-muted-foreground text-xs">
              <svg className="w-3.5 h-3.5 text-success mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {feature}
            </div>
          ))}
        </div>
      </div>

      <GradientButton href="/register-society" size="sm">
        Get Started
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </GradientButton>
    </div>
  );

  return (
    <section id={useCase.id} className={`py-16 ${isReversed ? "bg-muted-bg" : "bg-card"}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid lg:grid-cols-2 gap-10 items-center ${isReversed ? "lg:flex-row-reverse" : ""}`}>
          {isReversed ? (
            <>
              <FadeInRight className="lg:order-2">{ImageComponent}</FadeInRight>
              <FadeInLeft className="lg:order-1">{ContentComponent}</FadeInLeft>
            </>
          ) : (
            <>
              <FadeInLeft>{ImageComponent}</FadeInLeft>
              <FadeInRight>{ContentComponent}</FadeInRight>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export function UseCasesPageContent() {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative py-16 bg-foreground overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/website/building-modern.jpg" alt="Modern building" fill className="object-cover opacity-15" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeInUp className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-card mb-4">
              Built for every type of <span className="text-primary">premises</span>
            </h1>
            <p className="text-base text-card/80">
              From residential societies to industrial facilities, VMS adapts to your unique needs.
            </p>
          </FadeInUp>
        </div>
      </section>

      {/* Quick Nav */}
      <section className="bg-card border-b border-border sticky top-16 z-30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
            {useCases.map((useCase) => (
              <Link
                key={useCase.id}
                href={`#${useCase.id}`}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition"
              >
                {useCase.title}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      {/* Use Cases */}
      {useCases.map((useCase, index) => (
        <UseCaseDetail key={useCase.id} useCase={useCase} isReversed={index % 2 === 1} />
      ))}

      {/* CTA Section */}
      <section className="py-12 bg-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInUp>
            <h2 className="text-xl sm:text-2xl font-bold text-card mb-3">
              Don&apos;t see your use case?
            </h2>
            <p className="text-card/80 text-sm mb-6 max-w-lg mx-auto">
              VMS is flexible and can be customized for your specific requirements.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <GradientButton href="/contact" variant="outline" size="md" className="bg-card text-primary border-card hover:bg-card/90">
                Contact Sales
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </GradientButton>
              <GradientButton href="/register-society" variant="secondary" size="md">
                Start Free Trial
              </GradientButton>
            </div>
          </FadeInUp>
        </div>
      </section>
    </div>
  );
}
