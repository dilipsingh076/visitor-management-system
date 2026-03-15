"use client";

import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, CheckCircle, Check, ArrowRight, MessageCircle } from "lucide-react";
import {
  FadeInUp,
  FadeInLeft,
  FadeInRight,
  GradientButton,
} from "@/components/marketing";
import { Text } from "@/components/ui";

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
      <Text variant="h2" as="h2" className="mb-2">{useCase.title}</Text>
      <Text variant="muted" className="mb-6">{useCase.description}</Text>

      <div className="mb-6">
        <Text variant="h4" as="h3" className="mb-3 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-error" />
          Common Challenges
        </Text>
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
        <Text variant="h4" as="h3" className="mb-3 flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4 text-success" />
          How VMS Helps
        </Text>
        <div className="grid sm:grid-cols-2 gap-2">
          {useCase.features.map((feature, i) => (
            <div key={i} className="flex items-start gap-1.5 text-muted-foreground text-xs">
              <Check className="w-3.5 h-3.5 text-success mt-0.5 flex-shrink-0" />
              {feature}
            </div>
          ))}
        </div>
      </div>

      <GradientButton href="/register-society" size="sm">
        Get Started
        <ArrowRight className="w-4 h-4" />
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
            <Text variant="h1" as="h1" className="text-card mb-4">Built for every type of <span className="text-primary">premises</span></Text>
            <Text variant="body" className="text-base text-card/80">
              Societies, offices, factories, and campuses—each with different challenges. See how VMS fits your use case.
            </Text>
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
            <Text variant="h2" as="h2" className="text-card mb-3">Don&apos;t see your use case?</Text>
            <Text variant="body" as="p" className="text-card/80 text-sm mb-6 max-w-lg mx-auto">
              VMS is flexible and can be customized for your specific requirements.
            </Text>
            <div className="flex flex-wrap justify-center gap-3">
              <GradientButton href="/contact" variant="outline" size="md" className="bg-card text-primary border-card hover:bg-card/90">
                Contact Sales
                <MessageCircle className="w-4 h-4" />
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
