import { Metadata } from "next";
import { UseCasesPageContent } from "./_components/UseCasesPageContent";

export const metadata: Metadata = {
  title: "Use cases — Societies, offices, factories, campuses",
  description:
    "See how VMS fits gated societies, corporate offices, industrial facilities, and educational institutions. Real scenarios and benefits.",
};

export default function UseCasesPage() {
  return <UseCasesPageContent />;
}
