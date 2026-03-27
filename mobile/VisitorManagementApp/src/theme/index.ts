import { colors } from './colors';

export { ThemeProvider, useTheme } from './ThemeContext';
export type { ThemeMode } from './ThemeContext';
export { lightPalette, darkPalette } from './colors';
export type { ColorPalette } from './colors';

export const theme = {
  colors,
  spacing: {
    xs: 4,
    sm: 6,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  // Match web: --radius-sm 0.5rem, md 0.75rem, lg 1rem, xl 1.5rem
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
  },
  /** Hood-style hub layouts */
  hub: {
    sectionGap: 10,
    tileGap: 8,
    tileMinHeight: 72,
  },
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 8,
    },
  },
} as const;
