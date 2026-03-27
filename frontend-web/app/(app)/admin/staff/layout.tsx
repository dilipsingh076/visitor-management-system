import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Staff",
  description: "Manage society staff members",
};

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
