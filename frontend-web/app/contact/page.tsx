"use client";

import { PageHeader, Card, LinkButton } from "@/components/ui";

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title="Contact"
        description="Get in touch with us for support, sales, or data and privacy inquiries."
      />

      <Card className="p-6 mb-8 space-y-8">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Support</h2>
          <p className="text-muted text-sm leading-relaxed mb-2">
            Need help with check-in, invitations, or technical issues? Our support team is here to assist.
          </p>
          <a href="mailto:support@vms.example.com" className="text-primary font-medium hover:underline">
            support@vms.example.com
          </a>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Sales</h2>
          <p className="text-muted text-sm leading-relaxed mb-2">
            Interested in deploying VMS for your society, office, or campus? Reach out to our sales team.
          </p>
          <a href="mailto:sales@vms.example.com" className="text-primary font-medium hover:underline">
            sales@vms.example.com
          </a>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Data / Privacy</h2>
          <p className="text-muted text-sm leading-relaxed mb-2">
            Questions about data collection, consent, retention, or DPDP compliance? Contact our privacy team.
          </p>
          <a href="mailto:privacy@vms.example.com" className="text-primary font-medium hover:underline">
            privacy@vms.example.com
          </a>
        </section>
      </Card>

      <div className="flex gap-4">
        <LinkButton href="/about" variant="secondary" size="md">About</LinkButton>
        <LinkButton href="/features" variant="secondary" size="md">Features</LinkButton>
        <LinkButton href="/privacy" variant="secondary" size="md">Privacy</LinkButton>
      </div>
    </div>
  );
}
