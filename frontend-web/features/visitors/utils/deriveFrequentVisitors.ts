import type { Visit } from "@/types";
import type { FrequentVisitor } from "../types";

function formatLastVisit(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const visitDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.floor(
    (today.getTime() - visitDay.getTime()) / (24 * 60 * 60 * 1000)
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "Last week";
  return d.toLocaleDateString();
}

export function deriveFrequentVisitors(
  visits: Array<
    Pick<
      Visit,
      "visitor_id" | "visitor_name" | "visitor_phone" | "purpose" | "created_at"
    >
  >
): FrequentVisitor[] {
  const byVisitor = new Map<
    string,
    {
      visitor_id: string;
      name: string;
      phone: string;
      purposes: string[];
      dates: string[];
    }
  >();

  for (const v of visits) {
    const key = v.visitor_id;
    const existing = byVisitor.get(key);
    const purpose = v.purpose || "Visit";
    if (!existing) {
      byVisitor.set(key, {
        visitor_id: key,
        name: v.visitor_name,
        phone: v.visitor_phone || "",
        purposes: [purpose],
        dates: [v.created_at],
      });
    } else {
      existing.dates.push(v.created_at);
      if (!existing.purposes.includes(purpose)) existing.purposes.push(purpose);
    }
  }

  return Array.from(byVisitor.values())
    .map((data) => ({
      id: data.visitor_id,
      name: data.name,
      phone: data.phone,
      purpose: data.purposes[0] || "Visit",
      visit_count: data.dates.length,
      last_visit: formatLastVisit(data.dates.sort().reverse()[0]),
    }))
    .sort((a, b) => b.visit_count - a.visit_count);
}

