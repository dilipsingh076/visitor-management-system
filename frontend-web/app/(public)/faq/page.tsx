import { Metadata } from "next";
import { PageHeader, Card, LinkButton, Text } from "@/components/ui";

export const metadata: Metadata = {
  title: "FAQ — Check-in, DPDP, and how VMS works",
  description:
    "Frequently asked questions about visitor management, OTP/QR check-in, walk-ins, DPDP compliance, data residency, and the VMS mobile app.",
};

const FAQ_GROUPS = [
  {
    heading: "Check-in & workflow",
    items: [
      {
        q: "How does check-in work?",
        a: "The host creates an invite and gets a one-time OTP or QR code, then shares it with the visitor (e.g. via WhatsApp). At the gate, the visitor enters the OTP or scans the QR, accepts the data-use consent (DPDP), and is checked in. The host is notified immediately. When the visitor leaves, the guard marks check-out.",
      },
      {
        q: "What if a visitor arrives without a pre-invite?",
        a: "Guards can register walk-ins: they select which resident the visitor is here to see, and the resident gets a notification to approve or reject. Once approved, the visitor gets the check-in details and follows the same OTP/QR flow.",
      },
      {
        q: "Can we export who is inside the premises?",
        a: "Yes. Authorized users can download a muster CSV from the dashboard with everyone currently checked in—essential for fire drills, emergencies, and safety compliance.",
      },
    ],
  },
  {
    heading: "Compliance & data",
    items: [
      {
        q: "Is VMS DPDP compliant?",
        a: "Yes. We capture explicit consent at check-in, maintain immutable audit logs, and support data access and erasure requests under the DPDP Act 2023. See our Privacy & DPDP page for details.",
      },
      {
        q: "Is data stored in India?",
        a: "Data residency depends on your deployment. You can host the backend and database in India to meet localisation or internal policy requirements. Contact us for options.",
      },
    ],
  },
  {
    heading: "Product & access",
    items: [
      {
        q: "Who can use VMS?",
        a: "Gated societies, corporate offices, factories, and campuses. Residents or hosts invite visitors; guards manage the gate; visitors check in with OTP or QR. Each deployment is isolated—you control your data.",
      },
      {
        q: "Is there a mobile app?",
        a: "We're building a native mobile app so residents and committee members can invite guests, approve walk-ins, and stay in sync with the web dashboard. Sign up for updates on our Contact page.",
      },
      {
        q: "How do we share invites (WhatsApp, etc.)?",
        a: "Invite links and OTP/QR codes can be shared through any channel—WhatsApp, SMS, or in person. For custom or business WhatsApp API integration, contact sales.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        centered
        title="Frequently asked questions"
        description="Clear answers on check-in, compliance, and how VMS works. Can't find what you need? Contact us."
      />
      <div className="max-w-3xl mx-auto space-y-10 mb-12">
        {FAQ_GROUPS.map((group, gi) => (
          <section key={gi}>
            <Text variant="eyebrow" className="mb-4">{group.heading}</Text>
            <div className="space-y-4">
              {group.items.map((item, i) => (
                <Card key={i} className="p-5 rounded-xl border border-border hover:border-primary/20 transition-colors">
                  <Text variant="h3" as="h3" className="mb-2">{item.q}</Text>
                  <Text variant="muted" className="leading-relaxed">{item.a}</Text>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <LinkButton href="/how-it-works" variant="secondary" size="md">How it works</LinkButton>
        <LinkButton href="/contact" variant="primary" size="md">Contact us</LinkButton>
        <LinkButton href="/features" variant="secondary" size="md">Features</LinkButton>
      </div>
    </div>
  );
}
