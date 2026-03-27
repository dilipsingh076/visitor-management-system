import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequent Visitors",
  description: "View and manage frequent visitors",
};

export default function FrequentVisitorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
