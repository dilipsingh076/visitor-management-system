import { PageWrapper } from "@/components/common";
import { theme } from "@/lib/theme";

export default function Loading() {
  return (
    <PageWrapper width="narrow">
      <div className={theme.loading.page}>
        <div className={theme.loading.line} />
        <div className="mt-6 h-64 bg-muted-bg rounded animate-pulse" />
      </div>
    </PageWrapper>
  );
}
