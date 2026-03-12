import { PageWrapper } from "@/components/common";
import { theme } from "@/lib/theme";

export default function Loading() {
  return (
    <PageWrapper width="narrow">
      <div className={theme.loading.page}>
        <div className={theme.loading.line} />
        <div className={theme.loading.input} />
        <div className={theme.list.card}>
          <div className={`p-12 text-center ${theme.text.muted}`}>Loading…</div>
        </div>
      </div>
    </PageWrapper>
  );
}

