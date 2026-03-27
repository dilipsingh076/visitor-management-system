import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meetings",
  description: "Platform meeting management",
};

export default function PlatformMeetingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
