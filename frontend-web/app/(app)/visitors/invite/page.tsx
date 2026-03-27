import { Suspense } from "react";
import { InviteVisitorPageContent } from "./_components/InviteVisitorPageContent";
import { PageWrapper } from "@/components/common";
import { theme } from "@/lib/theme";

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <PageWrapper width="narrower">
          <p className={theme.text.muted}>Loading…</p>
        </PageWrapper>
      }
    >
      <InviteVisitorPageContent />
    </Suspense>
  );
}
