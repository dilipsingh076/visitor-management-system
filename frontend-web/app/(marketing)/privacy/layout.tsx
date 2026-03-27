import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Data privacy and DPDP Act 2023 compliance",
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
