"use client";

import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/features/auth";
import { ThemeProvider } from "@/features/theme";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>{children}</AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
