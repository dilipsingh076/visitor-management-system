import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buildings",
  description: "Manage buildings and flats",
};

export default function BuildingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
