"use client";

import { Input } from "@/components/ui";

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  "aria-label"?: string;
}

const SearchIcon = () => (
  <svg
    className="w-5 h-5 text-muted-foreground"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className = "",
  "aria-label": ariaLabel = "Search",
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`.trim()}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <SearchIcon />
      </span>
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10"
        aria-label={ariaLabel}
      />
    </div>
  );
}
