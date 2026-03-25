import { MainAppLayout } from "@/components/layout/MainAppLayout";

export default function VisitorsSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainAppLayout>{children}</MainAppLayout>;
}
