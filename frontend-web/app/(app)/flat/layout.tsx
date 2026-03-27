import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Flat",
  description: "View flat details and manage members",
};

export default function FlatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
