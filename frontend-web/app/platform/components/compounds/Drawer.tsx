"use client";

import { useEffect, useCallback } from "react";
import { X } from "lucide-react";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  position?: "left" | "right";
  size?: "sm" | "md" | "lg" | "xl";
  footer?: React.ReactNode;
}

const sizeStyles = {
  sm: "w-72",
  md: "w-96",
  lg: "w-[28rem]",
  xl: "w-[32rem]",
};

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  position = "right",
  size = "md",
  footer,
}: DrawerProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const positionClasses = position === "right" 
    ? "right-0 animate-in slide-in-from-right" 
    : "left-0 animate-in slide-in-from-left";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`
          fixed inset-y-0 ${positionClasses} ${sizeStyles[size]}
          bg-card shadow-xl z-50 flex flex-col duration-200
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-border shrink-0">
          <div>
            {title && <h2 className="text-base font-semibold text-foreground">{title}</h2>}
            {description && (
              <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted-bg transition text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-border shrink-0">{footer}</div>
        )}
      </div>
    </>
  );
}
