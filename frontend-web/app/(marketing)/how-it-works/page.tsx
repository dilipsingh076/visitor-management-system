import { Metadata } from "next";
import { HowItWorksPageContent } from "./_components/HowItWorksPageContent";

export const metadata: Metadata = {
  title: "How VMS works — Invite, check-in, verify",
  description:
    "Residents invite. Visitors check in with OTP or QR. Guards verify. See the workflow for residents, visitors, and security staff.",
};

export default function HowItWorksPage() {
  return <HowItWorksPageContent />;
}
