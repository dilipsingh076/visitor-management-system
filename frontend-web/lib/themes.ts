/**
 * Theme definitions — each theme overrides CSS custom properties defined in :root.
 * The default values in styles/theme.css (:root block) match "emerald-light".
 *
 * Every theme MUST override ALL visual variables to prevent leaking between switches.
 */

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  colors: Record<string, string>;
}

function shadowsForPrimary(r: number, g: number, b: number) {
  return {
    "--shadow-button": `0 1px 3px rgba(${r}, ${g}, ${b}, 0.2), 0 1px 2px rgba(${r}, ${g}, ${b}, 0.12)`,
    "--shadow-button-hover": `0 4px 12px rgba(${r}, ${g}, ${b}, 0.25), 0 2px 4px rgba(${r}, ${g}, ${b}, 0.15)`,
    "--shadow-input-focus": `0 0 0 3px rgba(${r}, ${g}, ${b}, 0.15)`,
  };
}

const LIGHT_SHADOWS = {
  "--shadow-xs": "0 1px 2px rgba(0, 0, 0, 0.04)",
  "--shadow-sm": "0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)",
  "--shadow-md": "0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
  "--shadow-lg": "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.05)",
  "--shadow-xl": "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
  "--shadow-card": "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.03)",
  "--shadow-card-hover": "0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -4px rgba(0, 0, 0, 0.04)",
  "--shadow-header": "0 1px 0 rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.03)",
  "--shadow-sidebar": "2px 0 8px rgba(0, 0, 0, 0.04)",
  "--shadow-dropdown": "0 10px 40px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
};

const DARK_SHADOWS = {
  "--shadow-xs": "0 1px 2px rgba(0, 0, 0, 0.3)",
  "--shadow-sm": "0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3)",
  "--shadow-md": "0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)",
  "--shadow-lg": "0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3)",
  "--shadow-xl": "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
  "--shadow-card": "0 0 0 1px rgba(255, 255, 255, 0.04), 0 1px 3px rgba(0, 0, 0, 0.3)",
  "--shadow-card-hover": "0 0 0 1px rgba(255, 255, 255, 0.06), 0 8px 16px rgba(0, 0, 0, 0.4)",
  "--shadow-header": "0 1px 0 rgba(255, 255, 255, 0.05)",
  "--shadow-sidebar": "1px 0 0 rgba(255, 255, 255, 0.05)",
  "--shadow-dropdown": "0 8px 30px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)",
};

/**
 * Build a complete dark theme. Overrides EVERY visual variable.
 */
function darkTheme(opts: {
  primary: [number, number, number];
  primaryHex: string;
  primaryHover: string;
  primaryDark: string;
  primaryLight: string;
  primaryMuted: string;
  bg: string;
  fg?: string;
  muted?: string;
  mutedFg?: string;
  card: string;
  surfaceRaised: string;
  border: string;
  borderSubtle: string;
}): Record<string, string> {
  // For dark themes, primary-light and primary-muted must be semi-transparent
  // so they look correct as section backgrounds on dark surfaces
  const [pr, pg, pb] = opts.primary;
  return {
    // Primary
    "--color-primary": opts.primaryHex,
    "--color-primary-hover": opts.primaryHover,
    "--color-primary-dark": opts.primaryDark,
    "--color-primary-light": `rgba(${pr}, ${pg}, ${pb}, 0.15)`,
    "--color-primary-muted": `rgba(${pr}, ${pg}, ${pb}, 0.08)`,
    "--color-primary-50": `rgba(${pr}, ${pg}, ${pb}, 0.08)`,
    // Neutrals
    "--color-background": opts.bg,
    "--color-foreground": opts.fg ?? "#f1f5f9",
    "--color-muted": opts.muted ?? "#94a3b8",
    "--color-muted-foreground": opts.mutedFg ?? "#64748b",
    "--color-muted-bg": opts.card,
    "--color-border": opts.border,
    "--color-border-subtle": opts.borderSubtle,
    "--color-card": opts.card,
    "--color-surface-raised": opts.surfaceRaised,
    "--color-surface-sunken": opts.bg,
    // Semantic — brighter on dark backgrounds for readability
    "--color-success": "#34d399",
    "--color-success-light": "rgba(52, 211, 153, 0.15)",
    "--color-warning": "#fbbf24",
    "--color-warning-hover": "#f59e0b",
    "--color-warning-light": "rgba(251, 191, 36, 0.15)",
    "--color-error": "#f87171",
    "--color-error-hover": "#ef4444",
    "--color-error-light": "rgba(248, 113, 113, 0.15)",
    "--color-info": "#60a5fa",
    "--color-info-light": "rgba(96, 165, 250, 0.15)",
    // Shadows
    ...DARK_SHADOWS,
    ...shadowsForPrimary(...opts.primary),
  };
}

function lightTheme(opts: {
  primary: [number, number, number];
  primaryHex: string;
  primaryHover: string;
  primaryDark: string;
  primaryLight: string;
  primaryMuted: string;
  bg?: string;
  fg?: string;
  muted?: string;
  mutedFg?: string;
  mutedBg?: string;
  border?: string;
  borderSubtle?: string;
  card?: string;
}): Record<string, string> {
  return {
    "--color-primary": opts.primaryHex,
    "--color-primary-hover": opts.primaryHover,
    "--color-primary-dark": opts.primaryDark,
    "--color-primary-light": opts.primaryLight,
    "--color-primary-muted": opts.primaryMuted,
    "--color-primary-50": opts.primaryMuted,
    "--color-background": opts.bg ?? "#f8fafc",
    "--color-foreground": opts.fg ?? "#0f172a",
    "--color-muted": opts.muted ?? "#64748b",
    "--color-muted-foreground": opts.mutedFg ?? "#94a3b8",
    "--color-muted-bg": opts.mutedBg ?? "#f1f5f9",
    "--color-border": opts.border ?? "#e2e8f0",
    "--color-border-subtle": opts.borderSubtle ?? "#f1f5f9",
    "--color-card": opts.card ?? "#ffffff",
    "--color-surface-raised": opts.card ?? "#ffffff",
    "--color-surface-sunken": opts.bg ?? "#f8fafc",
    "--color-success": "#059669",
    "--color-success-light": "#d1fae5",
    "--color-warning": "#d97706",
    "--color-warning-hover": "#b45309",
    "--color-warning-light": "#fef3c7",
    "--color-error": "#dc2626",
    "--color-error-hover": "#b91c1c",
    "--color-error-light": "#fee2e2",
    "--color-info": "#0284c7",
    "--color-info-light": "#e0f2fe",
    ...LIGHT_SHADOWS,
    ...shadowsForPrimary(...opts.primary),
  };
}

export const THEMES: ThemeDefinition[] = [
  {
    id: "emerald-light",
    name: "Emerald Light",
    description: "Clean light mode with emerald accents",
    colors: lightTheme({
      primary: [5, 150, 105],
      primaryHex: "#059669",
      primaryHover: "#047857",
      primaryDark: "#065f46",
      primaryLight: "#d1fae5",
      primaryMuted: "#ecfdf5",
    }),
  },
  {
    id: "indigo-light",
    name: "Indigo Light",
    description: "Modern and professional blue-violet",
    colors: lightTheme({
      primary: [79, 70, 229],
      primaryHex: "#4f46e5",
      primaryHover: "#4338ca",
      primaryDark: "#3730a3",
      primaryLight: "#e0e7ff",
      primaryMuted: "#eef2ff",
      bg: "#f8faff",
      mutedBg: "#eef2ff",
      border: "#ddd6fe",
      borderSubtle: "#eef2ff",
    }),
  },
  {
    id: "rose-light",
    name: "Rose Light",
    description: "Soft and warm pink tones",
    colors: lightTheme({
      primary: [225, 29, 72],
      primaryHex: "#e11d48",
      primaryHover: "#be123c",
      primaryDark: "#9f1239",
      primaryLight: "#ffe4e6",
      primaryMuted: "#fff1f2",
      bg: "#fffbfb",
      mutedBg: "#fff1f2",
      border: "#fecdd3",
      borderSubtle: "#fff1f2",
    }),
  },
  {
    id: "amber-light",
    name: "Amber Light",
    description: "Warm and inviting golden tones",
    colors: lightTheme({
      primary: [217, 119, 6],
      primaryHex: "#d97706",
      primaryHover: "#b45309",
      primaryDark: "#92400e",
      primaryLight: "#fef3c7",
      primaryMuted: "#fffbeb",
      bg: "#fffdf7",
      mutedBg: "#fef9ee",
      border: "#fde68a",
      borderSubtle: "#fef9ee",
    }),
  },
  {
    id: "emerald-dark",
    name: "Emerald Dark",
    description: "Dark mode with emerald green",
    colors: darkTheme({
      primary: [16, 185, 129],
      primaryHex: "#10b981",
      primaryHover: "#059669",
      primaryDark: "#047857",
      primaryLight: "#d1fae5",
      primaryMuted: "#ecfdf5",
      bg: "#0f172a",
      card: "#1e293b",
      surfaceRaised: "#273548",
      border: "#334155",
      borderSubtle: "#1e293b",
    }),
  },
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    description: "Deep blue, nautical feel",
    colors: darkTheme({
      primary: [59, 130, 246],
      primaryHex: "#3b82f6",
      primaryHover: "#2563eb",
      primaryDark: "#1d4ed8",
      primaryLight: "#dbeafe",
      primaryMuted: "#eff6ff",
      bg: "#0c1222",
      card: "#162032",
      surfaceRaised: "#1c2a42",
      border: "#1e3a5f",
      borderSubtle: "#162032",
    }),
  },
  {
    id: "sunset-orange",
    name: "Sunset Orange",
    description: "Warm and cozy amber tones",
    colors: darkTheme({
      primary: [249, 115, 22],
      primaryHex: "#f97316",
      primaryHover: "#ea580c",
      primaryDark: "#c2410c",
      primaryLight: "#ffedd5",
      primaryMuted: "#fff7ed",
      bg: "#1a1210",
      fg: "#fef3c7",
      muted: "#a8977a",
      mutedFg: "#6b5c47",
      card: "#2a1f1a",
      surfaceRaised: "#352820",
      border: "#3d2e24",
      borderSubtle: "#2a1f1a",
    }),
  },
  {
    id: "purple-haze",
    name: "Purple Haze",
    description: "Creative and bold violet",
    colors: darkTheme({
      primary: [168, 85, 247],
      primaryHex: "#a855f7",
      primaryHover: "#9333ea",
      primaryDark: "#7e22ce",
      primaryLight: "#f3e8ff",
      primaryMuted: "#faf5ff",
      bg: "#130f1e",
      card: "#1e1833",
      surfaceRaised: "#271f42",
      border: "#2d2547",
      borderSubtle: "#1e1833",
    }),
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Ultra-minimal near-black",
    colors: darkTheme({
      primary: [161, 161, 170],
      primaryHex: "#a1a1aa",
      primaryHover: "#d4d4d8",
      primaryDark: "#71717a",
      primaryLight: "#f4f4f5",
      primaryMuted: "#fafafa",
      bg: "#09090b",
      fg: "#e4e4e7",
      muted: "#a1a1aa",
      mutedFg: "#52525b",
      card: "#18181b",
      surfaceRaised: "#27272a",
      border: "#27272a",
      borderSubtle: "#18181b",
    }),
  },
];

export const THEME_MAP: Record<string, ThemeDefinition> = Object.fromEntries(
  THEMES.map((t) => [t.id, t])
);

export const DEFAULT_THEME_ID = "emerald-light";

export function getFlashPreventionScript(): string {
  const map: Record<string, Record<string, string>> = {};
  for (const t of THEMES) {
    map[t.id] = t.colors;
  }
  return `(function(){try{var t=localStorage.getItem('vms-theme');if(t){var m=${JSON.stringify(map)};var v=m[t];if(v){var s=document.documentElement.style;for(var k in v)s.setProperty(k,v[k])}}}catch(e){}})()`;
}
