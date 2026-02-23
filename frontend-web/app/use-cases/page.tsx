"use client";

import { PageHeader, Card, LinkButton } from "@/components/ui";

const CASES = [
  {
    title: "Gated Societies & Apartments",
    desc: "Residents invite guests via app. Visitors check in with OTP/QR. Guards manage walk-ins and check-outs. Emergency muster for fire drills.",
    icon: "🏢",
  },
  {
    title: "Corporate Offices",
    desc: "Pre-approved meetings, vendor check-ins, and visitor logs. Blacklist management. DPDP-compliant consent and audit trails.",
    icon: "💼",
  },
  {
    title: "Factories & Warehouses",
    desc: "Track contractors, delivery personnel, and visitors. Time-bound visits. Export who's on premises for safety compliance.",
    icon: "🏭",
  },
  {
    title: "Schools & Campuses",
    desc: "Parent pickups, guest lectures, and event visitors. Host approval for unknown visitors. Quick muster for emergencies.",
    icon: "🎓",
  },
];

export default function UseCasesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        centered
        title="Use Cases"
        description="VMS fits societies, offices, factories, and campuses."
      />
      <div className="grid md:grid-cols-2 gap-6 mb-14">
        {CASES.map((c, i) => (
          <Card key={i} className="p-8 hover:shadow-card transition">
            <span className="text-3xl block mb-4">{c.icon}</span>
            <h2 className="text-xl font-semibold text-foreground mb-3">{c.title}</h2>
            <p className="text-muted text-sm leading-relaxed">{c.desc}</p>
          </Card>
        ))}
      </div>
      <div className="flex justify-center gap-4">
        <LinkButton href="/features" variant="primary" size="lg">See Features</LinkButton>
        <LinkButton href="/login" variant="secondary" size="lg">Get Started</LinkButton>
      </div>
    </div>
  );
}
