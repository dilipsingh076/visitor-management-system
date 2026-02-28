import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/providers/ClientProviders";
import ConditionalShell from "@/components/layout/ConditionalShell";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Visitor Management System | Secure Check-in for Societies & Offices",
  description: "India-Optimized VMS for gated societies, offices, and factories. Pre-approval, QR/OTP check-in, DPDP compliant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className="font-sans antialiased min-h-screen bg-background overflow-x-hidden">
        <ClientProviders>
          <ConditionalShell>{children}</ConditionalShell>
        </ClientProviders>
      </body>
    </html>
  );
}
