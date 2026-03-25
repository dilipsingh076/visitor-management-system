import { MainAppLayout } from "@/components/layout/MainAppLayout";

export default function GuardSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainAppLayout>{children}</MainAppLayout>;
}
