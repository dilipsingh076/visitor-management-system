import { Metadata } from "next";
import { AboutPageContent } from "./_components/AboutPageContent";

export const metadata: Metadata = {
  title: "About VMS — Why we built visitor management for India",
  description:
    "We built VMS to replace paper registers and chaotic gate processes. Learn our story, values, and how we serve societies and offices across India.",
};

export default function AboutPage() {
  return <AboutPageContent />;
}
