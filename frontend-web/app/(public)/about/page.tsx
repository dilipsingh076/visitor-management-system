import type { Metadata } from "next";
import { PageHeader, Card, LinkButton } from "@/components/ui";
import { AboutImage } from "./_components/AboutImage";

export const metadata: Metadata = {
  title: "About VMS | Visitor Management for India",
  description: "India-optimized visitor management for gated societies, offices, factories, and campuses. Pre-approval, QR/OTP check-in, DPDP compliant.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:px-16">
      <PageHeader title="About VMS" description="India-optimized visitor management for gated societies, offices, factories, and campuses." />
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 mb-10">
        <Card className="p-6 lg:p-10 rounded-2xl">
          <p className="text-muted leading-relaxed mb-4">
            Visitor Management System (VMS) is an India-focused platform for secure, contactless visitor registration at gated societies, corporate offices, factories, and schools. We replace paper registers and ad-hoc processes with a single flow: pre-approve guests, check them in with OTP or QR at the gate, and keep a real-time record for residents and security.
          </p>
          <p className="text-muted leading-relaxed mb-4">
            VMS supports pre-approval and invites (with optional WhatsApp delivery), QR and OTP check-in, guard-registered walk-ins (with resident approval), blacklist management, and emergency muster export. The product is built to align with the Digital Personal Data Protection Act 2023: we capture explicit consent at check-in, maintain audit logs, and support data access and erasure requests.
          </p>
          <p className="text-muted leading-relaxed mb-4">
            The system is built with FastAPI, Next.js, and React Native, so you get a web dashboard for residents and guards, plus mobile-friendly check-in for visitors.
          </p>
          <p className="text-muted leading-relaxed">
            Three roles drive the flow: <strong className="text-foreground">Residents</strong> invite and approve visitors and get notified when guests check in; <strong className="text-foreground">Guards</strong> register walk-ins, manage check-in/check-out, and export muster; and <strong className="text-foreground">Visitors</strong> receive OTP or QR and check in at the gate or reception with a single consent step.
          </p>
        </Card>
        <div>
          <AboutImage />
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        <LinkButton href="/features" variant="primary" size="md">Features</LinkButton>
        <LinkButton href="/how-it-works" variant="secondary" size="md">How it works</LinkButton>
      </div>
    </div>
  );
}
