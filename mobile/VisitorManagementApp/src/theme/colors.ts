/**
 * Light and dark palettes aligned with web (frontend-web styles/theme.css).
 * Use via useTheme() so the app reacts to theme changes.
 */
export type ColorPalette = {
  primary: string;
  primaryDark: string;
  primaryHover: string;
  primaryLight: string;
  primaryMuted: string;
  background: string;
  surface: string;
  card: string;
  overlay: string;
  border: string;
  borderLight: string;
  mutedBg: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  text: string;
  textSecondary: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  info: string;
  infoLight: string;
  accent: string;
  accentLight: string;
};

/** Web-style light theme (matches theme.css / globals.css) */
export const lightPalette: ColorPalette = {
  primary: '#059669',
  primaryDark: '#047857',
  primaryHover: '#047857',
  primaryLight: '#d1fae5',
  primaryMuted: '#ecfdf5',
  background: '#f8fafc',
  surface: '#ffffff',
  card: '#ffffff',
  overlay: 'rgba(248, 250, 252, 0.9)',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  mutedBg: '#f1f5f9',
  foreground: '#0f172a',
  muted: '#64748b',
  mutedForeground: '#94a3b8',
  text: '#0f172a',
  textSecondary: '#64748b',
  success: '#059669',
  successLight: '#d1fae5',
  warning: '#d97706',
  warningLight: '#fef3c7',
  error: '#dc2626',
  errorLight: '#fee2e2',
  info: '#0284c7',
  infoLight: '#e0f2fe',
  accent: '#059669',
  accentLight: '#d1fae5',
};

/** Dark theme (web palette on dark surfaces) */
export const darkPalette: ColorPalette = {
  primary: '#059669',
  primaryDark: '#047857',
  primaryHover: '#047857',
  primaryLight: 'rgba(5, 150, 105, 0.22)',
  primaryMuted: 'rgba(5, 150, 105, 0.12)',
  background: '#0f172a',
  surface: '#020617',
  card: '#1e293b',
  overlay: 'rgba(15, 23, 42, 0.9)',
  border: '#334155',
  borderLight: '#1e293b',
  mutedBg: '#1e293b',
  foreground: '#f1f5f9',
  muted: '#94a3b8',
  mutedForeground: '#64748b',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  success: '#059669',
  successLight: 'rgba(5, 150, 105, 0.2)',
  warning: '#d97706',
  warningLight: 'rgba(217, 119, 6, 0.2)',
  error: '#dc2626',
  errorLight: 'rgba(220, 38, 38, 0.2)',
  info: '#0284c7',
  infoLight: 'rgba(2, 132, 199, 0.2)',
  accent: '#059669',
  accentLight: 'rgba(5, 150, 105, 0.2)',
};

/** Default export for backward compat: dark palette (use useTheme() in components) */
export const colors = darkPalette;
