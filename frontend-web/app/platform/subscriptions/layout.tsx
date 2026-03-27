import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subscriptions",
  description: "Manage society subscriptions",
};

export default function SubscriptionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
