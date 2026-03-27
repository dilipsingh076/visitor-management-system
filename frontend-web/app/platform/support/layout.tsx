import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support",
  description: "Support ticket management",
};

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
