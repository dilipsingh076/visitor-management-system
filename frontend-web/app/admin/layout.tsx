import { MainAppLayout } from "@/components/layout/MainAppLayout";

export default function AdminSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainAppLayout>{children}</MainAppLayout>;
}
