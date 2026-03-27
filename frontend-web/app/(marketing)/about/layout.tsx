import { Metadata } from "next";
import { WebPageJsonLd, BreadcrumbJsonLd } from "@/components/seo";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vms.in";

export const metadata: Metadata = {
  title: "About Us - Our Mission & Team",
  description:
    "Learn about VMS - India's leading visitor management system. Our mission to replace paper registers with secure, contactless check-in. Meet our team and see our journey.",
  keywords: [
    "about VMS",
    "visitor management company",
    "VMS India team",
    "contactless security startup",
    "DPDP compliant company",
  ],
  openGraph: {
    title: "About VMS - Making Visitor Management Simple",
    description:
      "Our mission to replace paper registers with secure, contactless visitor management for Indian societies and offices.",
    url: `${BASE_URL}/about`,
    images: [
      {
        url: "/images/og/about.jpg",
        width: 1200,
        height: 630,
        alt: "VMS Team",
      },
    ],
  },
  alternates: {
    canonical: `${BASE_URL}/about`,
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <WebPageJsonLd
        title="About VMS"
        description="Learn about our mission to transform visitor management in India."
        url={`${BASE_URL}/about`}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: BASE_URL },
          { name: "About", url: `${BASE_URL}/about` },
        ]}
      />
      {children}
    </>
  );
}
