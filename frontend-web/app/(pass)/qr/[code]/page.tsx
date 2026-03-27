import { Suspense } from "react";
import { VisitQrPageContent } from "./_components/VisitQrPageContent";

export default function VisitQrPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>}>
      <VisitQrPageContent />
    </Suspense>
  );
}
