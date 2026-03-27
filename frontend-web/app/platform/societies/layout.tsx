import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Societies",
  description: "Manage registered societies",
};

export default function SocietiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
