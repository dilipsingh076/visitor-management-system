import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audit Logs",
  description: "View platform audit trail",
};

export default function AuditLogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
