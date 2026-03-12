import { PageWrapper } from "@/components/common";
import { theme } from "@/lib/theme";

export default function Loading() {
  return (
    <PageWrapper width="narrower">
      <div className={theme.loading.page}>
        <div className="h-10 bg-muted-bg rounded-lg w-40 animate-pulse mb-4" />
        <div className={theme.loading.line} />
        <div className="h-96 bg-muted-bg rounded-xl animate-pulse" />
      </div>
    </PageWrapper>
  );
}

