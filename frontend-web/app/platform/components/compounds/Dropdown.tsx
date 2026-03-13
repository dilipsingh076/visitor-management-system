"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface DropdownItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  destructive?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  onSelect: (value: string) => void;
  align?: "left" | "right";
  selectedValue?: string;
}

export function Dropdown({
  trigger,
  items,
  onSelect,
  align = "right",
  selectedValue,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    onSelect(value);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <div
          className={`
            absolute mt-1 w-48 bg-card rounded-lg shadow-lg border border-border z-20 py-1
            animate-in fade-in zoom-in-95 duration-100
            ${align === "right" ? "right-0" : "left-0"}
          `}
        >
          {items.map((item) => (
            <button
              key={item.value}
              onClick={() => !item.disabled && handleSelect(item.value)}
              disabled={item.disabled}
              className={`
                w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition
                ${item.disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-muted-bg"}
                ${item.destructive ? "text-error" : "text-foreground"}
              `}
            >
              {item.icon && <span className="w-4 h-4">{item.icon}</span>}
              <span className="flex-1">{item.label}</span>
              {selectedValue === item.value && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Simple action dropdown with button trigger
interface ActionDropdownProps {
  items: DropdownItem[];
  onSelect: (value: string) => void;
  label?: string;
}

export function ActionDropdown({ items, onSelect, label = "Actions" }: ActionDropdownProps) {
  return (
    <Dropdown
      trigger={
        <button className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted-bg transition">
          {label}
          <ChevronDown className="w-4 h-4" />
        </button>
      }
      items={items}
      onSelect={onSelect}
    />
  );
}
