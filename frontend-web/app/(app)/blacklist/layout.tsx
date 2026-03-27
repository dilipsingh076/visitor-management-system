import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blacklist",
  description: "Manage blacklisted visitors",
};

export default function BlacklistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
