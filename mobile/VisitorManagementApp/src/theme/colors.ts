/**
 * Mobile-specific color palette - warm, inviting, distinct from web
 * Indigo/Violet base for trust and modern app feel
 */
export const colors = {
  // Primary - Indigo (trust, calm - different from web's emerald)
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  primaryLight: '#E0E7FF',
  primaryMuted: '#EEF2FF',

  // Background - warm stone tone
  background: '#FAFAF9',
  surface: '#F5F5F4',

  // Text
  foreground: '#1C1917',
  muted: '#78716C',
  mutedForeground: '#A8A29E',

  // UI
  border: '#E7E5E4',
  borderLight: '#F5F5F4',
  card: '#FFFFFF',
  mutedBg: '#F5F5F4',

  // Semantic
  success: '#0D9488',
  successLight: '#CCFBF1',
  warning: '#EA580C',
  warningLight: '#FFEDD5',
  error: '#DC2626',
  errorLight: '#FEE2E2',
  info: '#0284C7',
  infoLight: '#E0F2FE',

  // Accent for variety
  accent: '#8B5CF6',
  accentLight: '#EDE9FE',
} as const;
