"use client";

import { PageHeader, Card, LinkButton } from "@/components/ui";

const FEATURES = [
  { title: "Pre-approval & Invitations", desc: "Residents invite visitors. QR + OTP generated. Optional WhatsApp.", icon: "📧" },
  { title: "Contactless Check-in", desc: "QR or OTP check-in. Consent for DPDP.", icon: "📱" },
  { title: "Guard Walk-in", desc: "Register unknown visitors. Resident approves.", icon: "👤" },
  { title: "Real-time Dashboard", desc: "Live stats, auto-refresh on Guard page.", icon: "📊" },
  { title: "Blacklist", desc: "Add/remove denied visitors.", icon: "🚫" },
  { title: "Muster Export", desc: "Emergency CSV of who's inside.", icon: "📋" },
  { title: "Host Notifications", desc: "Alert when visitor checks in.", icon: "🔔" },
  { title: "Time Validity", desc: "Expected arrival window ±60 min.", icon: "⏰" },
];

export default function FeaturesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        centered
        title="Features"
        description="Visitor management for societies, offices, and factories."
      />
      <div className="grid md:grid-cols-2 gap-6 mb-14">
        {FEATURES.map((f, i) => (
          <Card key={i} className="p-6 hover:shadow-card transition">
            <span className="text-2xl block mb-3">{f.icon}</span>
            <h2 className="text-lg font-semibold text-foreground mb-2">{f.title}</h2>
            <p className="text-muted text-sm">{f.desc}</p>
          </Card>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        <LinkButton href="/login" variant="primary" size="lg">Try it</LinkButton>
        <LinkButton href="/use-cases" variant="secondary" size="lg">Use Cases</LinkButton>
      </div>
    </div>
  );
}
