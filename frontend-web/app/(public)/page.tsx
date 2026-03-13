import { Metadata } from "next";
import { HomePageContent } from "./_components/HomePageContent";
import { WebPageJsonLd } from "@/components/seo";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vms.in";

export const metadata: Metadata = {
  title: "Secure Visitor Management for Societies & Offices",
  description:
    "India's #1 visitor management system. Replace paper registers with contactless OTP/QR check-in. Real-time dashboard, DPDP compliant. Free trial for societies.",
  keywords: [
    "visitor management system India",
    "society visitor management",
    "contactless check-in",
    "OTP visitor entry",
    "QR code gate entry",
    "DPDP compliant VMS",
    "gated community security",
  ],
  openGraph: {
    title: "VMS - Secure Visitor Management for Modern India",
    description:
      "Replace paper registers with contactless check-in. Pre-approve guests with OTP/QR. Real-time dashboard for guards.",
    url: BASE_URL,
    images: [
      {
        url: "/images/og/home.jpg",
        width: 1200,
        height: 630,
        alt: "VMS Dashboard Preview",
      },
    ],
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function HomePage() {
  return (
    <>
      <WebPageJsonLd
        title="VMS - Visitor Management System"
        description="India's leading visitor management for gated societies, offices, and factories."
        url={BASE_URL}
      />
      <HomePageContent />
    </>
  );
}
