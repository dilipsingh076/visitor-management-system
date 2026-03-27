import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nearby Places",
  description: "Discover places near the society",
};

export default function NearbyPlacesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
