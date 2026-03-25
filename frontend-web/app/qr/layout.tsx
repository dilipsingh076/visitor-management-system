import { MainAppLayout } from "@/components/layout/MainAppLayout";

export default function QrSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainAppLayout>{children}</MainAppLayout>;
}
