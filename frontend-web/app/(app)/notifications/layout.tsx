import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications",
  description: "View and manage notifications",
};

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
