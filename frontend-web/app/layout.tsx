import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/providers/ClientProviders";
import ConditionalShell from "@/components/layout/ConditionalShell";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  preload: true,
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vms.in";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "VMS - Visitor Management System",
    template: "%s | VMS",
  },
  description:
    "India-optimized visitor management for gated societies, offices, and factories. Pre-approval, QR/OTP check-in, DPDP compliant.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#10b981" },
    { media: "(prefers-color-scheme: dark)", color: "#059669" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <head>
        {/* Preconnect to external resources for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* DNS prefetch for API */}
        <link rel="dns-prefetch" href="//api.vms.in" />
      </head>
      <body className="font-sans antialiased min-h-screen bg-background overflow-x-hidden">
        <ClientProviders>
          <ConditionalShell>{children}</ConditionalShell>
        </ClientProviders>
      </body>
    </html>
  );
}
