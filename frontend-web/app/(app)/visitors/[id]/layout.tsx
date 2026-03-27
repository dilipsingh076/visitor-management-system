import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visit Details",
  description: "View detailed information about a visit",
};

export default function VisitDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
