import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Visitor stats, recent activity, and society overview",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
