import { Metadata } from "next";
import { Navbar, Footer } from "@/components/marketing";
import { OrganizationJsonLd, SoftwareApplicationJsonLd } from "@/components/seo";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vms.in";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "VMS - Visitor Management System | Secure Check-in for India",
    template: "%s | VMS - Visitor Management System",
  },
  description:
    "India's leading visitor management system for gated societies, offices, and factories. Contactless check-in with OTP/QR, DPDP Act 2023 compliant, real-time dashboard.",
  keywords: [
    "visitor management system",
    "VMS India",
    "gated society security",
    "contactless check-in",
    "OTP check-in",
    "QR code visitor",
    "DPDP compliant",
    "society visitor management",
    "office visitor tracking",
    "factory access control",
  ],
  authors: [{ name: "VMS Team" }],
  creator: "VMS",
  publisher: "VMS",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: BASE_URL,
    siteName: "VMS - Visitor Management System",
    title: "VMS - Secure Visitor Management for India",
    description:
      "Replace paper registers with contactless check-in. Pre-approve guests with OTP/QR. Real-time dashboard. DPDP compliant.",
    images: [
      {
        url: "/images/og/default.jpg",
        width: 1200,
        height: 630,
        alt: "VMS - Visitor Management System",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VMS - Visitor Management System",
    description:
      "Secure, contactless visitor management for Indian societies, offices, and factories.",
    images: ["/images/og/default.jpg"],
    creator: "@vms_india",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="public-layout min-h-screen flex flex-col">
      <OrganizationJsonLd />
      <SoftwareApplicationJsonLd />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
