import { Metadata } from "next";
import { WebPageJsonLd, BreadcrumbJsonLd, FAQJsonLd } from "@/components/seo";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vms.in";

export const metadata: Metadata = {
  title: "How It Works - Simple 3-Step Visitor Check-in",
  description:
    "Learn how VMS works for residents, visitors, and guards. Pre-approval with OTP/QR, contactless check-in at the gate, real-time notifications. Under 30 seconds to check in.",
  keywords: [
    "how VMS works",
    "visitor check-in process",
    "OTP gate entry process",
    "QR code visitor flow",
    "society visitor process",
    "contactless entry system",
  ],
  openGraph: {
    title: "How VMS Works - From Invite to Check-in",
    description:
      "Simple 3-step process: Invite, Share, Check-in. See how residents, visitors, and guards use VMS.",
    url: `${BASE_URL}/how-it-works`,
    images: [
      {
        url: "/images/og/how-it-works.jpg",
        width: 1200,
        height: 630,
        alt: "VMS Check-in Process",
      },
    ],
  },
  alternates: {
    canonical: `${BASE_URL}/how-it-works`,
  },
};

const howItWorksFaqs = [
  {
    question: "How long does check-in take?",
    answer:
      "With VMS, visitors can check in under 30 seconds. They simply enter their OTP or scan the QR code at the gate.",
  },
  {
    question: "Do visitors need to download an app?",
    answer:
      "No, visitors don't need any app. They receive an OTP via SMS/WhatsApp and enter it at the gate. The QR code can be scanned from any phone.",
  },
  {
    question: "What happens if a visitor arrives without a pre-invite?",
    answer:
      "Guards can register walk-in visitors and send an approval request to the resident. The resident can approve or reject from their phone.",
  },
];

export default function HowItWorksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <WebPageJsonLd
        title="How VMS Works"
        description="Simple 3-step process for visitor check-in at your society or office."
        url={`${BASE_URL}/how-it-works`}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: BASE_URL },
          { name: "How It Works", url: `${BASE_URL}/how-it-works` },
        ]}
      />
      <FAQJsonLd faqs={howItWorksFaqs} />
      {children}
    </>
  );
}
