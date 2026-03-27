import { Metadata } from "next";
import { WebPageJsonLd, FAQJsonLd, BreadcrumbJsonLd } from "@/components/seo";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vms.in";

export const metadata: Metadata = {
  title: "Features - Contactless Check-in, Dashboard & More",
  description:
    "VMS features: Pre-approval with OTP/QR, contactless check-in, real-time guard dashboard, blacklist management, muster export, DPDP compliance. All you need for secure visitor management.",
  keywords: [
    "VMS features",
    "contactless visitor check-in",
    "OTP gate entry",
    "QR code visitor management",
    "guard dashboard",
    "blacklist visitors",
    "muster export",
    "DPDP compliance",
  ],
  openGraph: {
    title: "VMS Features - Complete Visitor Management Solution",
    description:
      "Pre-approval, contactless check-in, real-time dashboard, DPDP compliance. Everything for secure access management.",
    url: `${BASE_URL}/features`,
    images: [
      {
        url: "/images/og/features.jpg",
        width: 1200,
        height: 630,
        alt: "VMS Features Overview",
      },
    ],
  },
  alternates: {
    canonical: `${BASE_URL}/features`,
  },
};

const featureFaqs = [
  {
    question: "How does OTP-based check-in work?",
    answer:
      "Residents create a visitor invite which generates a unique OTP. The visitor receives this via WhatsApp/SMS and enters it at the gate. The guard verifies it instantly.",
  },
  {
    question: "Is VMS compliant with DPDP Act 2023?",
    answer:
      "Yes, VMS is fully compliant with India's Digital Personal Data Protection Act 2023. We capture explicit consent, maintain audit logs, and support data access/erasure requests.",
  },
  {
    question: "Can I block specific visitors?",
    answer:
      "Yes, VMS includes blacklist management. You can block visitors by phone number or identity, and they will be prevented from checking in at your premises.",
  },
];

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <WebPageJsonLd
        title="VMS Features"
        description="Complete visitor management features: OTP/QR check-in, dashboard, blacklist, DPDP compliance."
        url={`${BASE_URL}/features`}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: BASE_URL },
          { name: "Features", url: `${BASE_URL}/features` },
        ]}
      />
      <FAQJsonLd faqs={featureFaqs} />
      {children}
    </>
  );
}
