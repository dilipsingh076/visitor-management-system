import type { Metadata } from "next";
import { PageHeader, Card, LinkButton } from "@/components/ui";

export const metadata: Metadata = {
  title: "Use Cases | VMS Visitor Management",
  description: "VMS for gated societies, corporate offices, factories, and schools. Contactless check-in, DPDP compliant. Built for India.",
};

const CASES = [
  {
    title: "Gated Societies & Apartments",
    desc: "Residents invite domestic helps, delivery personnel, and guests from the app and share OTP or QR — often via WhatsApp. Visitors check in at the main gate with a single code; guards see a live list and check them out when they leave. Walk-ins are registered and sent to the resident for approval. Emergency muster export supports fire drills and society compliance. Reduces gate congestion and 'who are you here to see?' calls.",
    icon: "🏢",
  },
  {
    title: "Corporate Offices",
    desc: "Pre-approve meeting guests and vendors with time-bound invites. Visitors check in at reception with OTP or QR; hosts are notified when they arrive. Maintain a full visitor log and blacklist for security. All consent and data handling align with the DPDP Act 2023, so offices can demonstrate compliance during audits.",
    icon: "💼",
  },
  {
    title: "Factories & Warehouses",
    desc: "Track contractors, delivery drivers, and temporary visitors with clear check-in and check-out. Use time validity so visits are scoped to expected windows. Export a muster list of who is on premises at any time — essential for safety and emergency evacuation. Guards manage walk-ins and blacklist without paper registers.",
    icon: "🏭",
  },
  {
    title: "Schools & Campuses",
    desc: "Manage parent pickups, guest speakers, and event visitors. Designated hosts approve unknown visitors; once approved, check-in is the same OTP/QR flow. Quick muster export for lockdown or emergency drills. Keeps campuses secure while making legitimate visits smooth and auditable.",
    icon: "🎓",
  },
];

export default function UseCasesPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <PageHeader
        centered
        title="Use Cases"
        description="VMS is built for Indian gated societies, corporate offices, factories, and schools — with one flow that scales."
      />

      {/* Use case visual */}
      <div className="grid lg:grid-cols-3 gap-6 mb-16">
        <div className="relative h-48 rounded-2xl overflow-hidden shadow-lg">
          <img src="/images/building.jpg" alt="Gated society" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/90 to-transparent flex items-end p-4">
            <p className="text-white font-semibold">Gated Societies</p>
          </div>
        </div>
        <div className="relative h-48 rounded-2xl overflow-hidden shadow-lg">
          <img src="/images/office.jpg" alt="Corporate office" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 to-transparent flex items-end p-4">
            <p className="text-white font-semibold">Corporate Offices</p>
          </div>
        </div>
        <div className="relative h-48 rounded-2xl overflow-hidden shadow-lg">
          <img src="/images/banner.jpg" alt="Factory entrance" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent flex items-end p-4">
            <p className="text-white font-semibold">Factories & Schools</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-16">
        {CASES.map((c, i) => (
          <Card key={i} className="p-8 rounded-2xl hover:shadow-card transition">
            <span className="text-3xl block mb-4">{c.icon}</span>
            <h2 className="text-xl font-semibold text-foreground mb-3">{c.title}</h2>
            <p className="text-muted text-sm leading-relaxed">{c.desc}</p>
          </Card>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        <LinkButton href="/features" variant="primary" size="lg">See Features</LinkButton>
        <LinkButton href="/login" variant="secondary" size="lg">Get Started</LinkButton>
      </div>
    </div>
  );
}
