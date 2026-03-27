import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Amenities",
  description: "Manage society amenities",
};

export default function AmenitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
