import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complaints",
  description: "Platform-wide complaint management",
};

export default function PlatformComplaintsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
