import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Users",
  description: "Manage society users and residents",
};

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
