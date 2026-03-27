"use client";

import Image from "next/image";
import {
  Mail,
  QrCode,
  User,
  BarChart3,
  Ban,
  FileText,
  Bell,
  Clock,
  ShieldCheck,
  ArrowRight,
  Check,
  Megaphone,
  Mic,
  MapPin,
  Building2,
  Home,
  Wrench,
  Sparkles,
} from "lucide-react";
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
  {
    title: "Invitations & passes",
    description:
      "Create invites with OTP, QR, or shareable links. Tie visits to building and flat when your society uses towers and units.",
    icon: <Mail className="h-6 w-6" />,
  },
  {
    title: "Contactless check-in",
    description:
      "Visitors complete OTP or QR check-in at the gate with explicit consent capture aligned to DPDP expectations.",
    icon: <QrCode className="h-6 w-6" />,
  },
  {
    title: "Guard walk-ins",
    description:
      "Register unexpected visitors, pick tower and flat, and notify the resident to approve before entry.",
    icon: <User className="h-6 w-6" />,
  },
  {
    title: "Live visitor views",
    description:
      "Guards and admins filter pending, approved, checked-in, and rejected visits with fast actions from one queue.",
    icon: <BarChart3 className="h-6 w-6" />,
  },
  {
    title: "Blacklist",
    description:
      "Block individuals by phone or identity so the gate desk can enforce society decisions consistently.",
    icon: <Ban className="h-6 w-6" />,
  },
  {
    title: "Muster export",
    description:
      "Download who is currently on premises as CSV for fire drills, incidents, or compliance reviews.",
    icon: <FileText className="h-6 w-6" />,
  },
  {
    title: "Notifications",
    description:
      "Residents receive alerts for invites, walk-ins, society notices, and visit outcomes—web and mobile where available.",
    icon: <Bell className="h-6 w-6" />,
  },
  {
    title: "Invite windows",
    description:
      "Set expected arrival and validity so guards know which visits are current—reducing confusion at peak hours.",
    icon: <Clock className="h-6 w-6" />,
  },
  {
    title: "Society notices",
    description:
      "Publish announcements to all members. Use optional AI drafting to turn a title into a full notice when AI is enabled.",
    icon: <Megaphone className="h-6 w-6" />,
  },
  {
    title: "Meetings AI",
    description:
      "Upload or record audio, transcribe, summarize, and query past meetings—built for committee and AGM workflows.",
    icon: <Mic className="h-6 w-6" />,
  },
  {
    title: "My flat & complaints",
    description:
      "Residents manage household members, complaints, and maintenance visibility from a single flat profile.",
    icon: <Home className="h-6 w-6" />,
  },
  {
    title: "Nearby places",
    description:
      "Surface pharmacies, hospitals, ATMs, and more around the society when administrators enable map search.",
    icon: <MapPin className="h-6 w-6" />,
  },
  {
    title: "Buildings & flats",
    description:
      "Configure towers, wings, and units so staff and residents see the same structure everywhere in the app.",
    icon: <Building2 className="h-6 w-6" />,
  },
  {
    title: "Amenities & staff",
    description:
      "Maintain a directory of society amenities and on-site maintenance roles so residents know who to contact.",
    icon: <Wrench className="h-6 w-6" />,
  },
  {
    title: "Platform-ready",
    description:
      "Super admins can onboard societies, manage plans, and support operations across multiple deployments.",
    icon: <Sparkles className="h-6 w-6" />,
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
            <Text variant="h1" as="h1" inverse className="mb-4">
              One platform for <span className="text-primary">invites, check-in, and compliance</span>
            </Text>
            <Text variant="body" inverse className="text-base">
              From digital invites and OTP/QR check-in to guard queues, society notices, meetings AI, flats, nearby places,
              and DPDP-ready consent—built for Indian societies, offices, and factories.
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
                src="/images/website/qr-scan.jpg"
                alt="Visitor scanning QR code at gate"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 flex items-center bg-gradient-to-r from-primary/90 to-primary/50 p-6">
                <div>
                  <Text variant="h4" as="p" className="mb-1 text-card">
                    Contactless check-in
                  </Text>
                  <Text variant="bodySmall" as="p" className="text-card/90">
                    OTP or QR — consent captured at the gate
                  </Text>
                </div>
              </div>
            </div>
          </FadeInLeft>
          
          <FadeInRight>
            <div className="group relative h-48 rounded-xl overflow-hidden shadow-lg">
              <Image
                src="/images/guard-dashboard.jpg"
                alt="Guard desk monitoring live visitor queue"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 flex items-center bg-gradient-to-r from-info/90 to-info/50 p-6">
                <div>
                  <Text variant="h4" as="p" className="mb-1 text-card">
                    Live guard desk
                  </Text>
                  <Text variant="bodySmall" as="p" className="text-card/90">
                    Pending, approved, and on-site in one view
                  </Text>
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
              description="Covers the full visitor lifecycle plus society operations—matching what you see in the VMS web app today."
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
            <Text variant="h2" as="h2" inverse className="mb-3">
              Get the full feature set with a free trial
            </Text>
            <Text variant="body" inverse as="p" className="text-sm mb-6 max-w-lg mx-auto">
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
