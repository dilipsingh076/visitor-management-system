"use client";

import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/features/auth";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </QueryProvider>
  );
}
