"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { SkeletonTable } from "../primitives/Spinner";

// Table wrapper
interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className = "" }: TableProps) {
  return (
    <div className={`bg-card rounded-xl border border-border overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">{children}</table>
      </div>
    </div>
  );
}

// Table head
export function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-border bg-muted-bg/50">{children}</tr>
    </thead>
  );
}

// Table header cell
interface TableThProps {
  children: React.ReactNode;
  className?: string;
  sortable?: boolean;
  sorted?: "asc" | "desc" | null;
  onSort?: () => void;
}

export function TableTh({
  children,
  className = "",
  sortable,
  sorted,
  onSort,
}: TableThProps) {
  return (
    <th
      className={`
        px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider
        ${sortable ? "cursor-pointer hover:text-foreground" : ""}
        ${className}
      `}
      onClick={sortable ? onSort : undefined}
    >
      <span className="flex items-center gap-1">
        {children}
        {sortable && sorted && (
          <span className="text-primary">
            {sorted === "asc" ? "↑" : "↓"}
          </span>
        )}
      </span>
    </th>
  );
}

// Table body
export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-border">{children}</tbody>;
}

// Table row
interface TableRowProps {
  children: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

export function TableRow({ children, onClick, selected, className = "" }: TableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={`
        transition
        ${onClick ? "cursor-pointer" : ""}
        ${selected ? "bg-primary/5" : "hover:bg-muted-bg/30"}
        ${className}
      `}
    >
      {children}
    </tr>
  );
}

// Table cell
interface TableTdProps {
  children: React.ReactNode;
  className?: string;
}

export function TableTd({ children, className = "" }: TableTdProps) {
  return <td className={`px-4 py-3 text-sm ${className}`}>{children}</td>;
}

// Empty state for table
interface TableEmptyProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  colSpan: number;
}

export function TableEmpty({ icon, title, description, action, colSpan }: TableEmptyProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center">
        {icon && (
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted-bg flex items-center justify-center text-muted-foreground">
            {icon}
          </div>
        )}
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
        {action && <div className="mt-3">{action}</div>}
      </td>
    </tr>
  );
}

// Loading state for table
export function TableLoading({ colSpan, rows = 5 }: { colSpan: number; rows?: number }) {
  return (
    <>
      {[...Array(rows)].map((_, i) => (
        <tr key={i}>
          <td colSpan={colSpan} className="px-4 py-3">
            <div className="h-4 bg-muted-bg rounded animate-pulse" />
          </td>
        </tr>
      ))}
    </>
  );
}

// Pagination component
interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
      <p className="text-xs text-muted-foreground">
        Showing {start} to {end} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className="p-1.5 rounded-lg border border-border hover:bg-muted-bg disabled:opacity-50 disabled:cursor-not-allowed transition"
          title="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-lg border border-border hover:bg-muted-bg disabled:opacity-50 disabled:cursor-not-allowed transition"
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="px-3 text-sm text-foreground">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-1.5 rounded-lg border border-border hover:bg-muted-bg disabled:opacity-50 disabled:cursor-not-allowed transition"
          title="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          className="p-1.5 rounded-lg border border-border hover:bg-muted-bg disabled:opacity-50 disabled:cursor-not-allowed transition"
          title="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
