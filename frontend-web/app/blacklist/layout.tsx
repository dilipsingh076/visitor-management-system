import { MainAppLayout } from "@/components/layout/MainAppLayout";

export default function BlacklistSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainAppLayout>{children}</MainAppLayout>;
}
