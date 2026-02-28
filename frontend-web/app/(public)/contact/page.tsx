import type { Metadata } from "next";
import { PageHeader, Card, LinkButton } from "@/components/ui";

export const metadata: Metadata = {
  title: "Contact | VMS Visitor Management",
  description: "Get in touch for support, sales, or privacy and DPDP compliance. Deploy VMS for your society or office.",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <PageHeader title="Contact" description="Get in touch for support, sales, or privacy and compliance." />
      
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <Card className="p-6 lg:p-8 rounded-2xl space-y-8">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Support</h2>
          <p className="text-muted text-sm mb-2">Need help with check-in flows, guard dashboard, or technical issues? We’re here to help residents, guards, and admins get the most out of VMS.</p>
          <a href="mailto:support@vms.example.com" className="text-primary font-medium hover:underline">support@vms.example.com</a>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Sales</h2>
          <p className="text-muted text-sm mb-2">Interested in deploying VMS for your society, office, factory, or campus? We can walk you through setup, roles, and DPDP-aligned data handling.</p>
          <a href="mailto:sales@vms.example.com" className="text-primary font-medium hover:underline">sales@vms.example.com</a>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Privacy & compliance</h2>
          <p className="text-muted text-sm mb-2">Questions about data storage, consent, audit logs, or DPDP Act 2023 compliance? Reach out for documentation or a discussion.</p>
          <a href="mailto:privacy@vms.example.com" className="text-primary font-medium hover:underline">privacy@vms.example.com</a>
        </section>
      </Card>
      
      <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg">
        <img src="/images/office.jpg" alt="Office reception" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-transparent flex items-center px-8">
          <div>
            <p className="text-white text-lg font-semibold">Deploy VMS for your organization</p>
            <p className="text-slate-300 text-sm mt-1">Societies • Offices • Factories • Campuses</p>
          </div>
        </div>
      </div>
    </div>
      <div className="flex flex-wrap gap-4">
        <LinkButton href="/features" variant="primary" size="md">See features</LinkButton>
        <LinkButton href="/how-it-works" variant="secondary" size="md">How it works</LinkButton>
      </div>
    </div>
  );
}
