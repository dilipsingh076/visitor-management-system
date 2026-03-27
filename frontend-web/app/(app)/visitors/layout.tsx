import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visitors",
  description: "Manage and track all visitor entries",
};

export default function VisitorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
