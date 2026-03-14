/**
 * Mobile-specific color palette.
 * Centralized tokens so screens use semantic names instead of hard-coded colors.
 */
export const colors = {
  // Brand / primary
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  primaryLight: '#E0E7FF',
  primaryMuted: '#EEF2FF',

  // Background layers
  background: '#0F172A', // canvas (slate-900)
  surface: '#020617', // header / app shell (slate-950)
  card: '#020617',
  overlay: 'rgba(15,23,42,0.85)',

  // Neutrals
  border: '#1E293B',
  borderLight: '#111827',
  mutedBg: '#020617',

  // Text
  foreground: '#E5E7EB', // primary text
  muted: '#9CA3AF',
  mutedForeground: '#6B7280',
  // Aliases used across screens (older code)
  text: '#E5E7EB',
  textSecondary: '#9CA3AF',

  // Semantic
  success: '#22C55E',
  successLight: 'rgba(34,197,94,0.1)',
  warning: '#F97316',
  warningLight: 'rgba(249,115,22,0.1)',
  error: '#EF4444',
  errorLight: 'rgba(239,68,68,0.1)',
  info: '#38BDF8',
  infoLight: 'rgba(56,189,248,0.1)',

  // Accent
  accent: '#8B5CF6',
  accentLight: 'rgba(139,92,246,0.1)',
} as const;
