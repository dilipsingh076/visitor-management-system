import { MainAppLayout } from "@/components/layout/MainAppLayout";

export default function NotificationsSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainAppLayout>{children}</MainAppLayout>;
}
