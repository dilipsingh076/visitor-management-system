import { Metadata } from "next";
import { FeaturesPageContent } from "./_components/FeaturesPageContent";

export const metadata: Metadata = {
  title: "Features — Visitor management built for India",
  description:
    "Pre-approval, OTP/QR check-in, real-time dashboard, blacklist, muster export, and DPDP compliance. One platform for societies, offices, and factories.",
};

export default function FeaturesPage() {
  return <FeaturesPageContent />;
}
