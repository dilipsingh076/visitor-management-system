import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Society Residents",
  description: "Manage society residents",
};

export default function SocietyResidentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
