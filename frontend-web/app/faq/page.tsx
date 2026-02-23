"use client";

import { PageHeader, Card, LinkButton } from "@/components/ui";

const FAQ = [
  {
    q: "How does visitor check-in work?",
    a: "Visitors receive an OTP or QR from the host. At the gate, they enter the OTP or scan the QR, agree to the consent checkbox (DPDP), and check in. The host is notified.",
  },
  {
    q: "What if a visitor arrives without a pre-invite?",
    a: "Guards can register walk-ins. The selected resident gets a notification and can approve or reject. Once approved, the visitor checks in as usual.",
  },
  {
    q: "Is VMS DPDP compliant?",
    a: "Yes. We capture explicit consent at check-in, store audit logs, and support data access and deletion requests. See our Privacy page for details.",
  },
  {
    q: "Can I export who is inside?",
    a: "Yes. Authenticated users can download a muster CSV with everyone currently checked in. Use this for fire drills and emergencies.",
  },
];

export default function FAQPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        centered
        title="FAQ"
        description="Common questions about VMS."
      />
      <div className="space-y-6 mb-10">
        {FAQ.map((item, i) => (
          <Card key={i} className="p-6">
            <h2 className="font-semibold text-foreground mb-2">{item.q}</h2>
            <p className="text-muted text-sm leading-relaxed">{item.a}</p>
          </Card>
        ))}
      </div>
      <div className="flex justify-center gap-4">
        <LinkButton href="/how-it-works" variant="secondary" size="md">How it works</LinkButton>
        <LinkButton href="/contact" variant="secondary" size="md">Contact</LinkButton>
      </div>
    </div>
  );
}
