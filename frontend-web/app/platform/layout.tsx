import { ClientProviders } from "@/providers/ClientProviders";
import { PlatformShell } from "./PlatformShell";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientProviders>
      <PlatformShell>{children}</PlatformShell>
    </ClientProviders>
  );
}
