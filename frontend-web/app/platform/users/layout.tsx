import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platform Users",
  description: "Manage platform-wide users",
};

export default function PlatformUsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
