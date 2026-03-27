import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Society Details",
  description: "View and manage society",
};

export default function SocietyDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
