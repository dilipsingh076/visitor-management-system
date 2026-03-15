"use client";

import Image from "next/image";
import { ShieldCheck, Zap, Globe, Users, ArrowRight } from "lucide-react";
import {
  FadeInUp,
  FadeInLeft,
  FadeInRight,
  AnimatedCounter,
  SectionHeading,
  GradientButton,
} from "@/components/marketing";
import { Text } from "@/components/ui";

const values = [
  { icon: <ShieldCheck className="w-6 h-6" />, title: "Security First", description: "Every feature designed with security at its core." },
  { icon: <Zap className="w-6 h-6" />, title: "Speed & Simplicity", description: "Check-in takes seconds, not minutes." },
  { icon: <Globe className="w-6 h-6" />, title: "India Focused", description: "Built for Indian societies and DPDP compliant." },
  { icon: <Users className="w-6 h-6" />, title: "User Centered", description: "Great experience for everyone." },
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
            <Text variant="h1" as="h1" className="text-card mb-4">
              We built VMS because visitor management <span className="text-primary">shouldn’t be painful</span>
            </Text>
            <Text variant="body" className="text-base text-card/80">
              Paper registers, guards on the phone all day, and zero visibility in an emergency—we lived it. 
              So we built one platform that gives residents, guards, and admins exactly what they need.
            </Text>
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
              <Text variant="eyebrow" className="mb-3">Our Story</Text>
              <Text variant="h2" as="h2" className="mb-4">From a broken gate experience to a product used across India</Text>
              <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
                <Text variant="muted">
                  VMS started when our founder moved into a gated society and hit the same problems:
                  paper registers no one could read, guards calling flat after flat to confirm visitors,
                  and no way to know who was on premises in an emergency.
                </Text>
                <Text variant="muted">
                  We built a single platform: residents send digital invites with OTP or QR codes, 
                  visitors check in at the gate without touching shared devices, and guards see 
                  who’s expected in real time. From day one we designed for India’s data protection 
                  laws—explicit consent, audit logs, and data subject rights.
                </Text>
                <Text variant="muted">
                  Today, hundreds of societies and offices use VMS every day. We’re also building 
                  a mobile app so residents and committees can manage visitors on the go, in sync 
                  with the web dashboard.
                </Text>
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
                  <Text variant="h2" as="p" className="text-2xl font-bold text-card">500+</Text>
                  <Text variant="caption" className="text-card/80">Societies trust us</Text>
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
              description="We design for real users: residents, guards, and admins who need clarity, not complexity."
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
                  <Text variant="h3" as="h3" className="mb-2">{value.title}</Text>
                  <Text variant="muted">{value.description}</Text>
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
                        <Text variant="h3" as="h3" className="mb-1">{milestone.title}</Text>
                        <Text variant="muted">{milestone.description}</Text>
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
                  <Text variant="h3" as="h3" className="text-card mb-0.5">{member.name}</Text>
                  <Text variant="body" className="text-card/60">{member.role}</Text>
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
            <Text variant="h2" as="h2" className="text-card mb-3">Ready to leave paper registers behind?</Text>
            <Text variant="body" as="p" className="text-card/80 text-sm mb-6 max-w-lg mx-auto">Start your free trial or talk to our team for a tailored demo.</Text>
            <div className="flex flex-wrap justify-center gap-3">
              <GradientButton href="/register-society" variant="outline" size="md" className="bg-card text-primary border-card hover:bg-card/90">
                Get Started Free
                <ArrowRight className="w-4 h-4" />
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
