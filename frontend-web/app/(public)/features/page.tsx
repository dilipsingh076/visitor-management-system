import type { Metadata } from "next";
import { PageHeader, Card, LinkButton } from "@/components/ui";

export const metadata: Metadata = {
  title: "Features | VMS Visitor Management",
  description: "Pre-approval, contactless check-in, guard walk-in, real-time dashboard, blacklist, muster export. DPDP-compliant visitor management for societies and offices.",
};

const FEATURES = [
  { title: "Pre-approval and Invitations", desc: "Residents create visitor invites with a single-use OTP or QR code. Invites can be shared via app or optional WhatsApp so guests have the code before they reach the gate. Reduces 'who are you here to see?' and speeds up entry.", icon: "📧" },
  { title: "Contactless Check-in", desc: "Visitors enter OTP or scan QR at the gate or reception, accept one-time consent (DPDP), and check in. No shared tablets or touch screens required. Host is notified immediately; guards see the live list.", icon: "📱" },
  { title: "Guard Walk-in", desc: "When a visitor arrives without a pre-invite, guards can register them and assign a resident. The resident gets a notification and can approve or reject. Once approved, the visitor checks in with the same flow.", icon: "👤" },
  { title: "Real-time Dashboard", desc: "Guards and admins see pending, approved, and checked-in visitors in one view. The Guard page auto-refreshes so you always have current counts and names. No more paper lists or phone calls to confirm.", icon: "📊" },
  { title: "Blacklist", desc: "Block specific visitors by phone or identity. Blacklisted entries are prevented from checking in. Useful for societies and offices that need to enforce access rules.", icon: "🚫" },
  { title: "Muster Export", desc: "Download a CSV of everyone currently inside the premises. Designed for fire drills, emergencies, and safety compliance. One click from the dashboard.", icon: "📋" },
  { title: "Host Notifications", desc: "Residents receive an alert when their visitor checks in, so they know exactly when to expect their guest. Reduces calls to the guard and improves visitor experience.", icon: "🔔" },
  { title: "Time Validity", desc: "Invites can have an expected arrival window (e.g. 2–4 PM). The system allows a configurable buffer (e.g. ±60 min) so early or slightly late visitors can still check in without creating new invites.", icon: "⏰" },
];

export default function FeaturesPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <PageHeader centered title="Features" description="Everything you need to run contactless, DPDP-compliant visitor management for societies, offices, factories, and campuses." />
      
      {/* Hero image banner */}
      <div className="relative h-64 lg:h-80 rounded-3xl overflow-hidden mb-16 shadow-lg">
        <img
          src="/images/security.jpg"
          alt="Reception security desk"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-900/40 flex items-center">
          <div className="px-8 lg:px-16">
            <p className="text-white text-xl lg:text-2xl font-semibold">Contactless. Compliant. Complete.</p>
            <p className="text-slate-300 mt-2">From pre-approval to check-out, one integrated system</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-16">
        {FEATURES.map((f, i) => (
          <Card key={i} className="p-6 lg:p-8 hover:shadow-card transition rounded-2xl">
            <span className="text-2xl block mb-3">{f.icon}</span>
            <h2 className="text-lg font-semibold text-foreground mb-2">{f.title}</h2>
            <p className="text-muted text-sm leading-relaxed">{f.desc}</p>
          </Card>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        <LinkButton href="/login" variant="primary" size="lg">Get started</LinkButton>
        <LinkButton href="/use-cases" variant="secondary" size="lg">See use cases</LinkButton>
        <LinkButton href="/contact" variant="secondary" size="lg">Try for your society</LinkButton>
      </div>
    </div>
  );
}
