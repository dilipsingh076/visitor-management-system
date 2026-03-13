"use client";

import { useState } from "react";

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: "default" | "pills" | "underline";
}

export function Tabs({ tabs, activeTab, onTabChange, variant = "default" }: TabsProps) {
  const baseStyles = "inline-flex items-center gap-2 text-sm font-medium transition";

  const variantStyles = {
    default: {
      container: "flex gap-1 p-1 bg-muted-bg rounded-lg",
      tab: "px-3 py-2 rounded-md",
      active: "bg-card text-foreground shadow-sm",
      inactive: "text-muted-foreground hover:text-foreground",
    },
    pills: {
      container: "flex flex-wrap gap-2",
      tab: "px-4 py-2 rounded-full border",
      active: "bg-primary text-card border-primary",
      inactive: "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground",
    },
    underline: {
      container: "flex border-b border-border",
      tab: "px-4 py-2.5 -mb-px border-b-2",
      active: "text-primary border-primary",
      inactive: "text-muted-foreground border-transparent hover:text-foreground hover:border-border",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={styles.container}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => !tab.disabled && onTabChange(tab.id)}
          disabled={tab.disabled}
          className={`
            ${baseStyles}
            ${styles.tab}
            ${activeTab === tab.id ? styles.active : styles.inactive}
            ${tab.disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          {tab.icon}
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={`
                px-1.5 py-0.5 text-xs rounded-full
                ${activeTab === tab.id ? "bg-card/20" : "bg-muted-bg"}
              `}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// Tab panel wrapper
interface TabPanelProps {
  children: React.ReactNode;
  tabId: string;
  activeTab: string;
}

export function TabPanel({ children, tabId, activeTab }: TabPanelProps) {
  if (tabId !== activeTab) return null;
  return <div className="mt-4">{children}</div>;
}

// Complete tabs with panels
interface TabsWithPanelsProps {
  tabs: (Tab & { content: React.ReactNode })[];
  defaultTab?: string;
  variant?: "default" | "pills" | "underline";
}

export function TabsWithPanels({ tabs, defaultTab, variant }: TabsWithPanelsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || "");

  return (
    <div>
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        variant={variant}
      />
      {tabs.map((tab) => (
        <TabPanel key={tab.id} tabId={tab.id} activeTab={activeTab}>
          {tab.content}
        </TabPanel>
      ))}
    </div>
  );
}
