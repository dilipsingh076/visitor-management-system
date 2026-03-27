import { Metadata } from "next";

export const metadata: Metadata = {
  title: "QR Check-in",
  description: "Scan QR code for check-in",
};

export default function QRCheckinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
