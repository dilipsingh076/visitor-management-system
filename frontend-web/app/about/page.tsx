"use client";

import { PageHeader, Card, LinkButton } from "@/components/ui";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader title="About VMS" />
      <Card className="p-6 mb-8">
        <p className="text-muted leading-relaxed mb-4">
          Visitor Management System (VMS) is an India-optimized platform for secure, contactless visitor registration
          in gated societies, corporate offices, factories, and campuses.
        </p>
        <p className="text-muted leading-relaxed mb-4">
          Built with FastAPI, Next.js, and React Native, VMS supports pre-approval via invite, QR/OTP check-in,
          guard walk-in registration, blacklist management, and emergency muster export. It is designed to comply
          with the DPDP Act 2023, including explicit consent capture and audit logging.
        </p>
        <p className="text-muted leading-relaxed">
          The system serves three primary roles: <strong className="text-foreground">Residents</strong> (hosts who invite and approve visitors),{" "}
          <strong className="text-foreground">Guards</strong> (who manage walk-ins and check-outs), and <strong className="text-foreground">Visitors</strong> (who check in
          using OTP or QR).
        </p>
      </Card>
      <div className="flex gap-4">
        <LinkButton href="/features" variant="primary" size="md">Features</LinkButton>
        <LinkButton href="/how-it-works" variant="secondary" size="md">How it works</LinkButton>
      </div>
    </div>
  );
}
