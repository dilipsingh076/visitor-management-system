import { MainAppLayout } from "@/components/layout/MainAppLayout";

export default function CheckinSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainAppLayout>{children}</MainAppLayout>;
}
