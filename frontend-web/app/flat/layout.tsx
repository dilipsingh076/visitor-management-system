import { MainAppLayout } from "@/components/layout/MainAppLayout";

export default function FlatSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainAppLayout>{children}</MainAppLayout>;
}
