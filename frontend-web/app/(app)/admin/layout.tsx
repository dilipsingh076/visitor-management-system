import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  description: "Society administration and management",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
