import { PageWrapper } from "@/components/common";
import { theme } from "@/lib/theme";

export default function Loading() {
  return (
    <PageWrapper width="narrow">
      <div className={theme.loading.page}>
        <div className="h-10 bg-muted-bg rounded-lg w-64 animate-pulse mb-6" />
        <div className="space-y-4">
          <div className="h-40 bg-muted-bg rounded-xl animate-pulse" />
          <div className="h-40 bg-muted-bg rounded-xl animate-pulse" />
          <div className="h-40 bg-muted-bg rounded-xl animate-pulse" />
        </div>
      </div>
    </PageWrapper>
  );
}

