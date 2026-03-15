"use client";

import Image from "next/image";
import { FadeInUp, SectionHeading, GradientButton } from "@/components/marketing";

const benefits = [
  { label: "Invite visitors on the go", icon: "📱" },
  { label: "Approve walk-ins instantly", icon: "✓" },
  { label: "Sync with web dashboard", icon: "🔄" },
  { label: "Push notifications", icon: "🔔" },
];

export function MobileComingSoon() {
  return (
    <section className="py-16 bg-card border-y border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <FadeInUp className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20 mb-4">
              <span className="text-primary text-xs font-semibold">Coming Soon</span>
            </div>
            <SectionHeading
              eyebrow="Available on Mobile"
              title={<>One platform. <span className="text-primary">Web and mobile.</span></>}
              description="We're building a native mobile app so residents and committee members can manage visitors from anywhere. Invite guests, approve walk-ins, and stay in sync with your web dashboard."
              className="mb-8"
            />
            <ul className="grid sm:grid-cols-2 gap-3 mb-8">
              {benefits.map((item, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <span className="text-lg" aria-hidden>{item.icon}</span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <GradientButton href="/contact" variant="secondary" size="sm">
                Get notified at launch
              </GradientButton>
            </div>
          </FadeInUp>
          <FadeInUp delay={0.1} className="order-1 lg:order-2 flex justify-center">
            <div className="relative max-w-[280px] mx-auto">
              <div className="aspect-[9/19] rounded-[2.5rem] border-[10px] border-foreground shadow-2xl overflow-hidden bg-muted-bg">
                <Image
                  src="/images/website/mobile-app.jpg"
                  alt="VMS mobile app preview - invite visitors and manage check-ins on the go"
                  width={280}
                  height={591}
                  className="object-cover w-full h-full"
                  sizes="280px"
                />
                <div className="absolute inset-0 flex items-end justify-center pb-8">
                  <span className="px-4 py-2 rounded-full bg-foreground/80 text-card text-xs font-medium backdrop-blur-sm">
                    Mobile app — coming soon
                  </span>
                </div>
              </div>
            </div>
          </FadeInUp>
        </div>
      </div>
    </section>
  );
}
