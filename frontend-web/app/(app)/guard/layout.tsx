import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guard Dashboard",
  description: "Guard view for visitor check-ins and walk-ins",
};

export default function GuardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
