"use client";
import { PageHeader, Card, LinkButton } from "@/components/ui";

const FAQ = [
  {
    q: "How does check-in work?",
    a: "The host creates an invite and shares a one-time OTP or QR code with the visitor (e.g. via WhatsApp). At the gate or reception, the visitor enters the OTP or scans the QR, accepts the consent screen for data use (DPDP), and is checked in. The host is notified immediately. When the visitor leaves, the guard marks check-out.",
  },
  {
    q: "What if a visitor arrives without a pre-invite?",
    a: "Guards can register walk-ins: they select which resident the visitor is here to see, and the resident gets a notification to approve or reject. Once approved, the visitor receives the check-in details and follows the same OTP/QR flow. No need to create a separate invite from the resident’s side.",
  },
  {
    q: "Is VMS DPDP compliant?",
    a: "Yes. We capture explicit consent at check-in, maintain immutable audit logs of visitor data, and support data access and erasure requests as envisaged under the DPDP Act 2023. For details, see our Privacy & DPDP page.",
  },
  {
    q: "Can we export a list of who is inside?",
    a: "Yes. Authorized users can download a muster CSV from the dashboard with everyone currently checked in. This is intended for fire drills, emergencies, and safety compliance.",
  },
  {
    q: "Who can use VMS?",
    a: "VMS is built for gated societies and apartments, corporate offices, factories and warehouses, and schools and campuses. Residents (or designated hosts) invite visitors; guards manage the gate and check-out; visitors check in with OTP or QR. Each deployment gets its own instance so you control your data.",
  },
  {
    q: "Is data stored in India?",
    a: "Deployment and data residency depend on your hosting choice. When you deploy VMS (e.g. for your society or office), you can host the backend and database in India to meet data localisation or organisational policy requirements. Contact us for deployment and infrastructure options.",
  },
  {
    q: "Can we use our own WhatsApp?",
    a: "Invite links and OTP/QR codes can be shared by residents through any channel — WhatsApp, SMS, or in person. The optional WhatsApp integration we refer to is for delivering the invite or code via WhatsApp when the resident sends it from the app. For custom or business WhatsApp API integration, contact sales.",
  },
];

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader centered title="FAQ" description="Common questions about visitor management, check-in, and DPDP compliance." />
      <div className="space-y-6 mb-10">
        {FAQ.map((item, i) => (
          <Card key={i} className="p-6 rounded-2xl">
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
