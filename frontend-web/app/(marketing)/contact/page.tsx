import { Metadata } from "next";
import { ContactPageContent } from "./_components/ContactPageContent";

export const metadata: Metadata = {
  title: "Contact — Demo, quote, or support",
  description:
    "Get a demo, custom quote, or technical support. We respond within 24 hours. Offices in Bangalore, Mumbai, and Pune.",
};

export default function ContactPage() {
  return <ContactPageContent />;
}
