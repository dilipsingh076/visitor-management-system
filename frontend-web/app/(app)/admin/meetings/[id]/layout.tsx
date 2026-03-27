import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meeting Details",
  description: "View meeting details and AI summary",
};

export default function MeetingDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
