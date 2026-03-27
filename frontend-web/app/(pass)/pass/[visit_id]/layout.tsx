import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visitor Pass",
  description: "Your visitor pass and QR code",
};

export default function VisitorPassLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
