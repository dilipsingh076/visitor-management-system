import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Check In",
  description: "Scan QR or enter OTP to check in visitors",
};

export default function CheckInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
