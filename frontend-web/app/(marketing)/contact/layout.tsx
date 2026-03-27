import { Metadata } from "next";
import { WebPageJsonLd, BreadcrumbJsonLd, FAQJsonLd } from "@/components/seo";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vms.in";

export const metadata: Metadata = {
  title: "Contact Us - Get a Demo or Support",
  description:
    "Contact VMS for demos, sales inquiries, or support. Our team is ready to help you modernize your visitor management. Offices in Bangalore, Mumbai, and Pune.",
  keywords: [
    "contact VMS",
    "VMS demo",
    "visitor management support",
    "VMS sales",
    "VMS pricing",
  ],
  openGraph: {
    title: "Contact VMS - Get in Touch",
    description:
      "Have questions? Want a demo? Our team is here to help you get started with secure visitor management.",
    url: `${BASE_URL}/contact`,
    images: [
      {
        url: "/images/og/contact.jpg",
        width: 1200,
        height: 630,
        alt: "Contact VMS",
      },
    ],
  },
  alternates: {
    canonical: `${BASE_URL}/contact`,
  },
};

const contactFaqs = [
  {
    question: "How long does setup take?",
    answer:
      "Most societies are up and running within 24 hours. Our team handles the initial setup and training.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes! We offer a 14-day free trial with full features. No credit card required.",
  },
  {
    question: "What support do you offer?",
    answer:
      "We provide email, phone, and WhatsApp support. Premium plans include dedicated account managers.",
  },
  {
    question: "Can I customize the system?",
    answer:
      "Yes, VMS is highly configurable. Custom branding, workflows, and integrations are available.",
  },
];

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <WebPageJsonLd
        title="Contact VMS"
        description="Get in touch with our team for demos, sales, or support."
        url={`${BASE_URL}/contact`}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: BASE_URL },
          { name: "Contact", url: `${BASE_URL}/contact` },
        ]}
      />
      <FAQJsonLd faqs={contactFaqs} />
      {children}
    </>
  );
}
