"use client";

import type { ReactNode } from "react";
import type { Visit } from "@/types";
import { Button } from "@/components/ui";

interface Column {
  key: keyof Visit | "actions";
  label: string;
  render?: (visit: Visit) => ReactNode;
}

interface GuardVisitsTableProps {
  visits: Visit[];
  columns: Column[];
  emptyMessage: string;
  action?: {
    label: string;
    onClick: (visit: Visit) => void;
    loadingId?: string | null;
    variant?: "primary" | "secondary" | "ghost" | "danger";
  };
  secondaryAction?: {
    label: string;
    onClick: (visit: Visit) => void;
    loadingId?: string | null;
    disabled?: boolean;
    className?: string;
  };
}

export function GuardVisitsTable({
  visits,
  columns,
  emptyMessage,
  action,
  secondaryAction,
}: GuardVisitsTableProps) {
  if (visits.length === 0) {
    return (
      <p className="px-4 py-6 text-center text-muted-foreground text-sm">
        {emptyMessage}
      </p>
    );
  }

  const getCellValue = (visit: Visit, key: Column["key"]): ReactNode => {
    if (key === "actions") {
      return (
        <div className="flex gap-2 items-center flex-wrap">
          {action && (
            <Button
              size="sm"
              variant={action.variant ?? "primary"}
              onClick={() => action.onClick(visit)}
              disabled={action.loadingId === visit.id}
            >
              {action.loadingId === visit.id ? "..." : action.label}
            </Button>
          )}
          {secondaryAction && visit.visitor_id && (
            <button
              type="button"
              onClick={() => secondaryAction.onClick(visit)}
              disabled={!!secondaryAction.loadingId || secondaryAction.disabled}
              className={`text-xs hover:underline disabled:opacity-50 ${secondaryAction.className ?? "text-error"}`}
            >
              {secondaryAction.loadingId || secondaryAction.disabled ? "…" : secondaryAction.label}
            </button>
          )}
        </div>
      );
    }
    const col = columns.find((c) => c.key === key);
    if (col?.render) return col.render(visit);
    const value = visit[key as keyof Visit];
    return value != null && value !== "" ? String(value) : "—";
  };

  return (
    <table className="min-w-full">
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground"
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {visits.map((visit) => (
          <tr key={visit.id} className="hover:bg-black/5">
            {columns.map((col) => (
              <td key={col.key} className="px-4 py-3 text-sm">
                {getCellValue(visit, col.key)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
