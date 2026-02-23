"use client";

import { PageHeader, Card, LinkButton } from "@/components/ui";

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title="Privacy & DPDP"
        description="How we handle visitor data in line with the Digital Personal Data Protection Act 2023 (DPDP)."
      />

      <Card className="p-6 mb-8 space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Data We Collect</h2>
          <p className="text-muted text-sm leading-relaxed">
            Visitor name, phone number, purpose of visit, and check-in/check-out timestamps. Host (resident) 
            details are stored for approval and notifications. Data is used solely for visitor management 
            and security purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Explicit Consent</h2>
          <p className="text-muted text-sm leading-relaxed">
            Visitors must explicitly consent to data processing at check-in. The consent checkbox and 
            timestamp are recorded in the audit log. Without consent, check-in cannot proceed.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Retention & Deletion</h2>
          <p className="text-muted text-sm leading-relaxed">
            Visit records are retained as per your organization&apos;s policy. Data subjects can request 
            access, correction, or erasure via the data fiduciary. Contact{" "}
            <a href="mailto:privacy@vms.example.com" className="text-primary hover:underline">privacy@vms.example.com</a>{" "}
            for such requests.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Security</h2>
          <p className="text-muted text-sm leading-relaxed">
            Data is stored securely. Audit logs capture consent and key events. Access is restricted 
            to authorized roles (residents, guards, admins). Muster/export features are protected 
            by authentication.
          </p>
        </section>
      </Card>

      <div className="flex gap-4">
        <LinkButton href="/contact" variant="secondary" size="md">Contact</LinkButton>
        <LinkButton href="/about" variant="secondary" size="md">About</LinkButton>
      </div>
    </div>
  );
}
