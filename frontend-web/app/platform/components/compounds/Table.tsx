"use client";

/**
 * Optimized table components (MUI / WAI-ARIA inspired).
 *
 * Row click (reliable): Use TableBody onRowClick + TableRow rowId + TableTd noRowClick.
 * - Clicks are handled via event delegation; only primary (left) click triggers row action.
 * - Links, buttons, and cells with noRowClick do not trigger onRowClick.
 *
 * Legacy: TableRow onClick still works but can be blocked by nested interactive elements.
 */

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  type ReactNode,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

const ROW_ID_ATTR = "data-row-id";
const NO_ROW_CLICK_ATTR = "data-no-row-click";

/** Density affects row/cell padding (compact = less padding). */
export type TableDensity = "compact" | "standard" | "comfortable";

const DENSITY_CLASSES: Record<TableDensity, { th: string; td: string }> = {
  compact: { th: "px-3 py-2", td: "px-3 py-2" },
  standard: { th: "px-4 py-3", td: "px-4 py-3" },
  comfortable: { th: "px-4 py-4", td: "px-4 py-4" },
};

// ---------------------------------------------------------------------------
// Table wrapper
// ---------------------------------------------------------------------------

interface TableProps {
  children: ReactNode;
  className?: string;
  /** Accessibility: describes the table for screen readers. */
  ariaLabel?: string;
  /** Optional caption (visually hidden if you use ariaLabel for visible title). */
  caption?: ReactNode;
  /** Row/cell density. Default: standard. */
  density?: TableDensity;
  /** Stick thead when scrolling (overflow). */
  stickyHeader?: boolean;
}

export function Table({
  children,
  className = "",
  ariaLabel = "Data table",
  caption,
  density = "standard",
  stickyHeader = false,
}: TableProps) {
  const densityStyles = DENSITY_CLASSES[density];
  return (
    <div
      className={`bg-card rounded-xl border border-border overflow-hidden ${className}`}
      role="region"
      aria-label={ariaLabel}
    >
      <div className="overflow-x-auto overflow-y-auto max-h-[inherit]">
        <table className="w-full border-collapse">
          {caption != null && <caption className="sr-only">{caption}</caption>}
          <TableContext.Provider value={{ densityStyles, stickyHeader }}>
            {children}
          </TableContext.Provider>
        </table>
      </div>
    </div>
  );
}

interface TableContextValue {
  densityStyles: { th: string; td: string };
  stickyHeader: boolean;
}

const TableContext = createContext<TableContextValue>({
  densityStyles: DENSITY_CLASSES.standard,
  stickyHeader: false,
});

function useTableOpts(): TableContextValue {
  return useContext(TableContext);
}

// ---------------------------------------------------------------------------
// Table head
// ---------------------------------------------------------------------------

export function TableHead({ children }: { children: ReactNode }) {
  const { stickyHeader } = useTableOpts();
  return (
    <thead
      className={stickyHeader ? "sticky top-0 z-10 bg-muted-bg/95 backdrop-blur border-b border-border" : ""}
    >
      <tr className="border-b border-border bg-muted-bg/50">{children}</tr>
    </thead>
  );
}

interface TableThProps {
  children: ReactNode;
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
  const { densityStyles } = useTableOpts();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTableCellElement>) => {
      if (sortable && onSort && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        onSort();
      }
    },
    [sortable, onSort]
  );

  const ariaSort =
    sortable && sorted != null
      ? sorted === "asc"
        ? "ascending"
        : "descending"
      : undefined;

  return (
    <th
      className={`
        ${densityStyles.th} text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider
        ${sortable ? "cursor-pointer hover:text-foreground select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded" : ""}
        ${className}
      `}
      onClick={sortable ? onSort : undefined}
      onKeyDown={handleKeyDown}
      tabIndex={sortable ? 0 : undefined}
      scope="col"
      aria-sort={ariaSort}
    >
      <span className="flex items-center gap-1">
        {children}
        {sortable && sorted != null && (
          <span className="text-primary" aria-hidden>
            {sorted === "asc" ? "↑" : "↓"}
          </span>
        )}
      </span>
    </th>
  );
}

// ---------------------------------------------------------------------------
// Table body – event delegation for reliable row click
// ---------------------------------------------------------------------------

interface TableBodyProps {
  children: ReactNode;
  /** When set, row clicks are handled via delegation. Use TableRow rowId and TableTd noRowClick. */
  onRowClick?: (rowId: string) => void;
  className?: string;
}

export function TableBody({ children, onRowClick, className = "" }: TableBodyProps) {
  const handlerRef = useRef(onRowClick);
  handlerRef.current = onRowClick;

  const handleClick = useCallback((e: MouseEvent<HTMLTableSectionElement>) => {
    const fn = handlerRef.current;
    if (!fn) return;
    if (e.button !== 0) return;

    const target = e.target as HTMLElement;
    if (target.closest(`[${NO_ROW_CLICK_ATTR}]`) != null) return;
    if (target.closest("a[href], button, [role='button'], input, select, textarea")) return;

    const row = target.closest(`tr[${ROW_ID_ATTR}]`);
    if (!row) return;

    const rowId = row.getAttribute(ROW_ID_ATTR)?.trim();
    if (rowId == null || rowId === "") return;
    fn(rowId);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTableSectionElement>) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const target = e.target as HTMLElement;
      const row = target.closest(`tr[${ROW_ID_ATTR}]`);
      if (!row) return;
      if (target.closest(`[${NO_ROW_CLICK_ATTR}]`) != null) return;
      if (target.closest("a[href], button, [role='button'], input, select, textarea")) return;
      const rowId = row.getAttribute(ROW_ID_ATTR)?.trim();
      const fn = handlerRef.current;
      if (rowId != null && rowId !== "" && fn) {
        e.preventDefault();
        fn(rowId);
      }
    },
    []
  );

  return (
    <tbody
      className={`divide-y divide-border ${className}`}
      onClick={onRowClick ? handleClick : undefined}
      onKeyDown={onRowClick ? handleKeyDown : undefined}
    >
      {children}
    </tbody>
  );
}

// ---------------------------------------------------------------------------
// Table row
// ---------------------------------------------------------------------------

interface TableRowProps {
  children: ReactNode;
  rowId?: string;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

export function TableRow({
  children,
  rowId,
  onClick,
  selected,
  className = "",
}: TableRowProps) {
  const isClickable = Boolean(rowId ?? onClick);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTableRowElement>) => {
      if (!onClick) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick();
      }
    },
    [onClick]
  );

  return (
    <tr
      {...(rowId != null && rowId !== "" ? { [ROW_ID_ATTR]: rowId } : {})}
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      tabIndex={onClick && !rowId ? 0 : undefined}
      className={`
        transition
        ${isClickable ? "cursor-pointer hover:bg-muted-bg/30 focus-within:bg-muted-bg/20" : ""}
        ${selected ? "bg-primary/5" : ""}
        ${className}
      `}
    >
      {children}
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Table cell
// ---------------------------------------------------------------------------

interface TableTdProps {
  children: ReactNode;
  className?: string;
  noRowClick?: boolean;
  /** Truncate long content with ellipsis. */
  truncate?: boolean;
  /** Cell alignment. */
  align?: "left" | "center" | "right";
  colSpan?: number;
}

export function TableTd({
  children,
  className = "",
  noRowClick,
  truncate,
  align = "left",
  colSpan,
}: TableTdProps) {
  const { densityStyles } = useTableOpts();
  const alignClass =
    align === "center" ? "text-center" : align === "right" ? "text-right" : "";

  return (
    <td
      className={`
        ${densityStyles.td} text-sm align-middle
        ${alignClass}
        ${truncate ? "max-w-0 truncate" : ""}
        ${className}
      `}
      colSpan={colSpan}
      {...(noRowClick ? { [NO_ROW_CLICK_ATTR]: "" } : {})}
    >
      {children}
    </td>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

interface TableEmptyProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  colSpan: number;
}

export function TableEmpty({
  icon,
  title,
  description,
  action,
  colSpan,
}: TableEmptyProps) {
  const safeColSpan = Math.max(1, Math.floor(colSpan) || 1);
  return (
    <tr>
      <td colSpan={safeColSpan} className="px-4 py-12 text-center">
        {icon != null && (
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted-bg flex items-center justify-center text-muted-foreground">
            {icon}
          </div>
        )}
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description != null && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
        {action != null && <div className="mt-3">{action}</div>}
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Loading state
// ---------------------------------------------------------------------------

interface TableLoadingProps {
  colSpan: number;
  rows?: number;
}

export function TableLoading({ colSpan, rows = 5 }: TableLoadingProps) {
  const safeColSpan = Math.max(1, Math.floor(colSpan) || 1);
  const safeRows = Math.max(1, Math.floor(rows) || 5);
  return (
    <>
      {Array.from({ length: safeRows }, (_, i) => (
        <tr key={i}>
          <td colSpan={safeColSpan} className="px-4 py-3">
            <div className="h-4 bg-muted-bg rounded animate-pulse" aria-hidden />
          </td>
        </tr>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  ariaLabel?: string;
}

export function Pagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  ariaLabel = "Table pagination",
}: PaginationProps) {
  if (totalPages <= 1 || total <= 0) return null;

  const start = Math.min((page - 1) * pageSize + 1, total);
  const end = Math.min(page * pageSize, total);

  return (
    <nav
      className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted-bg/20"
      aria-label={ariaLabel}
    >
      <p className="text-xs text-muted-foreground">
        Showing {start} to {end} of {total}
      </p>
      <div className="flex items-center gap-1" role="group" aria-label="Pagination controls">
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className="p-1.5 rounded-lg border border-border hover:bg-muted-bg disabled:opacity-50 disabled:cursor-not-allowed transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          title="First page"
          aria-label="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="p-1.5 rounded-lg border border-border hover:bg-muted-bg disabled:opacity-50 disabled:cursor-not-allowed transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          title="Previous page"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="px-3 text-sm text-foreground" aria-live="polite">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg border border-border hover:bg-muted-bg disabled:opacity-50 disabled:cursor-not-allowed transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          title="Next page"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg border border-border hover:bg-muted-bg disabled:opacity-50 disabled:cursor-not-allowed transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          title="Last page"
          aria-label="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}
