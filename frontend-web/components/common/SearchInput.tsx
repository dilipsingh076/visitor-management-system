"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui";

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  "aria-label"?: string;
}

const SearchIcon = () => <Search className="w-5 h-5 text-muted-foreground" aria-hidden />;

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
