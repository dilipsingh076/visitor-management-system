import { PageWrapper } from "@/components/common";
import { theme } from "@/lib/theme";

export default function Loading() {
  return (
    <PageWrapper width="wide">
      <div className={theme.loading.page}>
        <div className={theme.loading.line} />
        <div className={theme.loading.input} />
        <div className={theme.loading.card} />
      </div>
    </PageWrapper>
  );
}
