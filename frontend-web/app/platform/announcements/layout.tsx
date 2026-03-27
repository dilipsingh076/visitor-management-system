import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Announcements",
  description: "Manage platform announcements",
};

export default function AnnouncementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
