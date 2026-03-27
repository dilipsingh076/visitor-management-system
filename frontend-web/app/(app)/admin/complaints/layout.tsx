import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complaints",
  description: "View and resolve complaints",
};

export default function ComplaintsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
