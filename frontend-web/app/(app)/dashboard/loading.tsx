import { PageWrapper } from "@/components/common";
import { PageLoader, StatCardSkeleton } from "@/components/ui";

export default function Loading() {
  return (
    <PageWrapper width="wide">
      <PageLoader />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    </PageWrapper>
  );
}

