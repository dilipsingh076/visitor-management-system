"use client";

import Image from "next/image";
import {
  FadeInUp,
  FadeInLeft,
  FadeInRight,
  AnimatedCounter,
  SectionHeading,
  GradientButton,
} from "@/components/marketing";

const values = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Security First",
    description: "Every feature designed with security at its core.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Speed & Simplicity",
    description: "Check-in takes seconds, not minutes.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "India Focused",
    description: "Built for Indian societies and DPDP compliant.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: "User Centered",
    description: "Great experience for everyone.",
  },
];

const team = [
  { name: "Rahul Sharma", role: "Founder & CEO", initials: "RS" },
  { name: "Priya Patel", role: "CTO", initials: "PP" },
  { name: "Amit Desai", role: "Head of Product", initials: "AD" },
  { name: "Sneha Reddy", role: "Head of Operations", initials: "SR" },
];

const milestones = [
  { year: "2022", title: "Founded", description: "VMS was born from frustration with paper registers" },
  { year: "2023", title: "DPDP Ready", description: "First to achieve full DPDP Act compliance" },
  { year: "2024", title: "500+ Societies", description: "Reached milestone of 500 deployed societies" },
  { year: "2025", title: "Enterprise Launch", description: "Expanded to corporate offices and factories" },
];

const stats = [
  { value: 500, suffix: "+", label: "Societies" },
  { value: 50000, suffix: "+", label: "Daily Check-ins" },
  { value: 15, suffix: "+", label: "Cities" },
  { value: 99.9, suffix: "%", label: "Uptime" },
];

export function AboutPageContent() {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative py-16 bg-foreground overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/website/team-office.jpg"
            alt="Team collaboration"
            fill
            className="object-cover opacity-15"
            priority
            sizes="100vw"
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeInUp className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-card mb-4">
              Making visitor management <span className="text-primary">simple</span>
            </h1>
            <p className="text-base text-card/80">
              We&apos;re on a mission to replace paper registers and chaotic gate processes 
              with secure, contactless visitor management.
            </p>
          </FadeInUp>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative -mt-8 z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary rounded-xl p-6 shadow-lg">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-card mb-0.5">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-card/80 text-xs">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <FadeInLeft>
              <p className="text-primary font-semibold uppercase tracking-wider text-xs mb-3">Our Story</p>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">
                Born from frustration with paper registers
              </h2>
              <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
                <p>
                  VMS started when our founder moved into a new apartment complex and experienced 
                  firsthand the chaos of visitor management — paper registers with illegible handwriting, 
                  guards calling residents repeatedly, and zero record of who was actually on premises.
                </p>
                <p>
                  We built VMS to solve this problem with technology: pre-approval with OTP/QR codes, 
                  instant notifications to residents, and a real-time dashboard for guards. 
                  All while staying compliant with India&apos;s new data protection laws.
                </p>
                <p>
                  Today, we serve hundreds of societies and offices across India, processing thousands 
                  of visitor check-ins daily.
                </p>
              </div>
            </FadeInLeft>
            
            <FadeInRight>
              <div className="relative">
                <div className="relative h-72 rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src="/images/website/society.jpg"
                    alt="Gated society"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-primary text-card p-4 rounded-lg shadow-md">
                  <p className="text-2xl font-bold">500+</p>
                  <p className="text-card/80 text-xs">Societies trust us</p>
                </div>
              </div>
            </FadeInRight>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-muted-bg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <SectionHeading
              eyebrow="Our Values"
              title={<>What drives us <span className="text-primary">every day</span></>}
              className="mb-12"
            />
          </FadeInUp>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((value, index) => (
              <FadeInUp key={index} delay={index * 0.05}>
                <div className="bg-card p-6 rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all text-center h-full">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <SectionHeading
              eyebrow="Our Journey"
              title={<>Milestones along <span className="text-primary">the way</span></>}
              className="mb-12"
            />
          </FadeInUp>

          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-px bg-primary/30" />
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <FadeInUp key={index} delay={index * 0.1}>
                    <div className="relative flex gap-6">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-card flex items-center justify-center font-bold text-sm z-10 shadow-md">
                        {milestone.year}
                      </div>
                      <div className="flex-1 bg-muted-bg p-4 rounded-xl">
                        <h3 className="text-base font-semibold text-foreground mb-1">{milestone.title}</h3>
                        <p className="text-muted-foreground text-sm">{milestone.description}</p>
                      </div>
                    </div>
                  </FadeInUp>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <SectionHeading
              eyebrow="Our Team"
              title={<>Meet the people <span className="text-primary">behind VMS</span></>}
              description="A passionate team dedicated to making visitor management better."
              light
              className="mb-12"
            />
          </FadeInUp>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {team.map((member, index) => (
              <FadeInUp key={index} delay={index * 0.05}>
                <div className="bg-card/5 backdrop-blur-sm p-6 rounded-xl border border-card/10 text-center hover:border-primary/30 transition">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
                    <span className="text-card text-lg font-bold">{member.initials}</span>
                  </div>
                  <h3 className="text-base font-semibold text-card mb-0.5">{member.name}</h3>
                  <p className="text-card/60 text-sm">{member.role}</p>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInUp>
            <h2 className="text-xl sm:text-2xl font-bold text-card mb-3">
              Ready to modernize your visitor management?
            </h2>
            <p className="text-card/80 text-sm mb-6 max-w-lg mx-auto">
              Join hundreds of societies and offices already using VMS.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <GradientButton href="/register-society" variant="outline" size="md" className="bg-card text-primary border-card hover:bg-card/90">
                Get Started Free
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </GradientButton>
              <GradientButton href="/contact" variant="secondary" size="md">
                Contact Sales
              </GradientButton>
            </div>
          </FadeInUp>
        </div>
      </section>
    </div>
  );
}
