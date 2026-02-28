import type { Metadata } from "next";
import { PageHeader, Card, LinkButton } from "@/components/ui";

export const metadata: Metadata = {
  title: "How it works | VMS Visitor Management",
  description: "Resident, visitor, and guard flows. Pre-approve with OTP/QR, check in at the gate, get notified. See how it works.",
};

export default function HowItWorksPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <PageHeader
        centered
        title="How it works"
        description="Clear flows for residents, visitors, and guards — no paper, no confusion."
      />

      {/* Visual flow section */}
      <div className="grid lg:grid-cols-2 gap-8 mb-16">
        <div className="relative h-64 lg:h-96 rounded-3xl overflow-hidden shadow-lg">
          <img
            src="/images/qr-checkin.jpg"
            alt="Mobile check-in"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent flex items-end p-6">
            <div>
              <p className="text-white text-lg font-semibold">Visitors check in with OTP or QR</p>
              <p className="text-slate-300 text-sm mt-1">Contactless and instant</p>
            </div>
          </div>
        </div>
        <div className="relative h-64 lg:h-96 rounded-3xl overflow-hidden shadow-lg">
          <img
            src="/images/guard-dashboard.jpg"
            alt="Guard dashboard"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent flex items-end p-6">
            <div>
              <p className="text-white text-lg font-semibold">Guards see live visitor list</p>
              <p className="text-slate-300 text-sm mt-1">Real-time dashboard with check-in/check-out</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8 mb-12">
        <Card className="p-6 lg:p-8 rounded-2xl">
          <h2 className="text-lg font-bold text-foreground mb-3">Resident flow</h2>
          <p className="text-muted text-sm mb-4">As a host, you control who gets in and when.</p>
          <ol className="list-decimal list-inside space-y-2 text-muted text-sm leading-relaxed">
            <li>Create an invite: enter visitor name, phone, and purpose (e.g. delivery, meeting).</li>
            <li>Share the one-time OTP or QR with your visitor — via app or optional WhatsApp.</li>
            <li>If someone arrives without an invite, the guard registers them and you get a notification; approve or reject from the Visitors page.</li>
            <li>When your visitor checks in at the gate, you receive an instant notification so you know they’re on their way.</li>
          </ol>
        </Card>
        <Card className="p-6 lg:p-8 rounded-2xl">
          <h2 className="text-lg font-bold text-foreground mb-3">Visitor flow</h2>
          <p className="text-muted text-sm mb-4">Quick, contactless entry — no paper register.</p>
          <ol className="list-decimal list-inside space-y-2 text-muted text-sm leading-relaxed">
            <li>Receive the OTP or QR from your host (e.g. on WhatsApp or in person).</li>
            <li>At the gate or reception, enter the OTP or scan the QR on your phone.</li>
            <li>Accept the one-time consent for data use (DPDP). You’re checked in.</li>
            <li>Your host is notified. When you leave, the guard marks you as checked out for a complete audit trail.</li>
          </ol>
        </Card>
        <Card className="p-6 lg:p-8 rounded-2xl">
          <h2 className="text-lg font-bold text-foreground mb-3">Guard flow</h2>
          <p className="text-muted text-sm mb-4">One dashboard for all visitor activity.</p>
          <ol className="list-decimal list-inside space-y-2 text-muted text-sm leading-relaxed">
            <li>For walk-ins: register the visitor and select the resident they’re here to see. The resident approves or rejects from their app.</li>
            <li>View pending, approved, and checked-in visitors on the live dashboard. No need to call residents for every entry.</li>
            <li>When a visitor leaves, mark them as checked out. Records remain for audit and emergency muster.</li>
            <li>Manage the blacklist and export a muster CSV (who is inside) for fire drills or safety compliance.</li>
          </ol>
        </Card>
      </div>
      <div className="flex justify-center gap-4">
        <LinkButton href="/login" variant="primary" size="lg">Get Started</LinkButton>
        <LinkButton href="/features" variant="secondary" size="lg">Features</LinkButton>
      </div>
    </div>
  );
}
