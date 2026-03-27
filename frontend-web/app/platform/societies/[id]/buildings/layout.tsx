import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Society Buildings",
  description: "Manage society buildings",
};

export default function SocietyBuildingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
