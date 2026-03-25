import { MainAppLayout } from "@/components/layout/MainAppLayout";

export default function PassSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainAppLayout>{children}</MainAppLayout>;
}
