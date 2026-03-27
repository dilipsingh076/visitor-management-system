import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register Society",
  description: "Register a new society",
};

export default function RegisterSocietyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
