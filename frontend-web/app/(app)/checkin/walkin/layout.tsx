import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Walk-in Request",
  description: "Register a walk-in visitor at the gate",
};

export default function WalkInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
