import { MainAppLayout } from "@/components/layout/MainAppLayout";

export default function DashboardSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-page">
      <MainAppLayout>{children}</MainAppLayout>
    </div>
  );
}
