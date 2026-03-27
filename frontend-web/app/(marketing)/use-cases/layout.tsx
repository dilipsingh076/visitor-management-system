import { Metadata } from "next";
import { WebPageJsonLd, BreadcrumbJsonLd } from "@/components/seo";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vms.in";

export const metadata: Metadata = {
  title: "Use Cases - Societies, Offices, Factories & Schools",
  description:
    "VMS for every premises: Gated societies, corporate offices, industrial facilities, and schools. Pre-approval, contractor management, safety compliance, child security.",
  keywords: [
    "society visitor management",
    "office visitor system",
    "factory access control",
    "school visitor security",
    "contractor management system",
    "gated community VMS",
    "corporate reception system",
  ],
  openGraph: {
    title: "VMS Use Cases - Built for Every Premises",
    description:
      "From residential societies to factories - see how VMS adapts to your unique visitor management needs.",
    url: `${BASE_URL}/use-cases`,
    images: [
      {
        url: "/images/og/use-cases.jpg",
        width: 1200,
        height: 630,
        alt: "VMS Use Cases",
      },
    ],
  },
  alternates: {
    canonical: `${BASE_URL}/use-cases`,
  },
};

export default function UseCasesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <WebPageJsonLd
        title="VMS Use Cases"
        description="Visitor management for societies, offices, factories, and schools."
        url={`${BASE_URL}/use-cases`}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: BASE_URL },
          { name: "Use Cases", url: `${BASE_URL}/use-cases` },
        ]}
      />
      {children}
    </>
  );
}
