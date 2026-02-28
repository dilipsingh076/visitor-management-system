import { Suspense } from "react";
import { VisitorsPageContent } from "./_components/VisitorsPageContent";

export default function VisitorsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-10 text-muted-foreground">Loading...</div>}>
      <VisitorsPageContent />
    </Suspense>
  );
}
