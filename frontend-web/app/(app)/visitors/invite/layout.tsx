import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invite Visitor",
  description: "Send a new visitor invitation",
};

export default function InviteVisitorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
