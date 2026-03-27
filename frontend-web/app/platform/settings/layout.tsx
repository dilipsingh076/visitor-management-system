import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platform Settings",
  description: "Configure platform settings",
};

export default function PlatformSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
