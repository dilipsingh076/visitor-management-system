import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meeting Details",
  description: "Meeting details and AI-powered summaries",
};

export default function MeetingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
