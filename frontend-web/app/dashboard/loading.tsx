import { PageWrapper } from "@/components/common";
import { theme } from "@/lib/theme";

export default function Loading() {
  return (
    <PageWrapper width="wide">
      <div className={theme.loading.page}>
        <div className="h-10 bg-muted-bg rounded-lg w-64 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-28 bg-muted-bg rounded-xl animate-pulse" />
          <div className="h-28 bg-muted-bg rounded-xl animate-pulse" />
          <div className="h-28 bg-muted-bg rounded-xl animate-pulse" />
        </div>
      </div>
    </PageWrapper>
  );
}

