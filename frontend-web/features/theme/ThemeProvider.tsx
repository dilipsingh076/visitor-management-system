"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { THEMES, THEME_MAP, DEFAULT_THEME_ID, type ThemeDefinition } from "@/lib/themes";

interface ThemeContextType {
  themeId: string;
  setTheme: (id: string) => void;
  themes: ThemeDefinition[];
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY = "vms-theme";

const ALL_VAR_KEYS = Array.from(
  new Set(THEMES.flatMap((t) => Object.keys(t.colors)))
);

function applyTheme(id: string) {
  const theme = THEME_MAP[id];
  if (!theme) return;
  const style = document.documentElement.style;
  for (const key of ALL_VAR_KEYS) {
    style.removeProperty(key);
  }
  for (const [key, value] of Object.entries(theme.colors)) {
    style.setProperty(key, value);
  }
}

function getInitialThemeId(): string {
  if (typeof window === "undefined") return DEFAULT_THEME_ID;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && THEME_MAP[stored]) return stored;
  } catch {}
  return DEFAULT_THEME_ID;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState(getInitialThemeId);

  // Apply theme on mount (flash script already set vars, but this ensures full coverage)
  useEffect(() => {
    applyTheme(themeId);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setTheme = useCallback((id: string) => {
    if (!THEME_MAP[id]) return;
    setThemeId(id);
    localStorage.setItem(STORAGE_KEY, id);
    applyTheme(id);
  }, []);

  return (
    <ThemeContext.Provider value={{ themeId, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
