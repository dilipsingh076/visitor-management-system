"use client";

import { PageHeader, Card, LinkButton } from "@/components/ui";

export default function HowItWorksPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        centered
        title="How it works"
        description="Resident, Visitor, and Guard flows."
      />
      <div className="space-y-6 mb-10">
        <Card className="p-6">
          <h2 className="text-lg font-bold text-foreground mb-3">Resident flow</h2>
          <ol className="list-decimal list-inside space-y-2 text-muted text-sm">
            <li>Invite visitor (name, phone, purpose)</li>
            <li>Share OTP/QR with visitor</li>
            <li>Approve walk-ins from Visitors page</li>
            <li>Get notified when visitor checks in</li>
          </ol>
        </Card>
        <Card className="p-6">
          <h2 className="text-lg font-bold text-foreground mb-3">Visitor flow</h2>
          <ol className="list-decimal list-inside space-y-2 text-muted text-sm">
            <li>Get OTP/QR from host</li>
            <li>Enter OTP or scan QR at check-in</li>
            <li>Check consent (DPDP)</li>
            <li>Host notified when you check in</li>
            <li>Guard checks you out when leaving</li>
          </ol>
        </Card>
        <Card className="p-6">
          <h2 className="text-lg font-bold text-foreground mb-3">Guard flow</h2>
          <ol className="list-decimal list-inside space-y-2 text-muted text-sm">
            <li>Register walk-ins (select resident, resident approves)</li>
            <li>View pending, approved, checked-in on dashboard</li>
            <li>Check-out visitors when they leave</li>
            <li>Manage blacklist, export muster CSV</li>
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
