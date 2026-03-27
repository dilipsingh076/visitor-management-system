import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Society Settings",
  description: "Configure society settings",
};

export default function SocietySettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
