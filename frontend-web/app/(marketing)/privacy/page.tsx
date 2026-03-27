import { Metadata } from "next";
import { PageHeader, Card, LinkButton, Text } from "@/components/ui";

export const metadata: Metadata = {
  title: "Privacy & DPDP — How we handle visitor data",
  description:
    "Data we collect, explicit consent, retention, data residency, and security. VMS is designed for the Digital Personal Data Protection Act 2023.",
};

const SECTIONS = [
  {
    id: "data-we-collect",
    title: "Data we collect",
    body: "Visitor name, phone number, purpose of visit, and check-in/check-out timestamps. Host (resident) details are stored for approval and notifications. Data is used solely for visitor management and security.",
  },
  {
    id: "consent",
    title: "Explicit consent",
    body: "Visitors must explicitly consent to data processing at check-in. The consent action and timestamp are recorded in the audit log. Without consent, check-in cannot proceed.",
  },
  {
    id: "retention",
    title: "Retention & deletion",
    body: "Visit records are retained as per your organisation's policy. Data subjects can request access, correction, or erasure via the data fiduciary. Contact privacy@vms.example.com for such requests.",
  },
  {
    id: "residency",
    title: "Data residency",
    body: "Where your data is stored depends on how VMS is deployed. You can host the application and database in India to meet data localisation or internal policy. Contact us for deployment options.",
  },
  {
    id: "security",
    title: "Security",
    body: "Data is stored securely. Audit logs capture consent and key events. Access is restricted to authorised roles (residents, guards, admins). Muster and export are protected by authentication.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title="Privacy & DPDP"
        description="How we handle visitor data in line with the Digital Personal Data Protection Act 2023 (DPDP). Your data, your control."
      />
      <Text variant="muted" className="max-w-2xl mb-8">
        VMS is designed so that consent, retention, and data subject rights are built in. Below is a concise overview; for deployment-specific terms, contact us.
      </Text>
      <div className="grid gap-4 mb-8 max-w-3xl">
        {SECTIONS.map((section) => (
          <Card key={section.id} id={section.id} className="p-5 rounded-xl border border-border">
            <Text variant="h4" as="h2" className="mb-2">{section.title}</Text>
            <Text variant="muted" className="leading-relaxed">{section.body}</Text>
          </Card>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <LinkButton href="/contact" variant="primary" size="md">Contact</LinkButton>
        <LinkButton href="/about" variant="secondary" size="md">About</LinkButton>
        <LinkButton href="/faq" variant="secondary" size="md">FAQ</LinkButton>
      </div>
    </div>
  );
}
