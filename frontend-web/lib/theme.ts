/**
 * Central theme config: Tailwind class strings built from design tokens.
 * Use these instead of raw Tailwind in components so branding stays consistent.
 * Tokens come from styles/theme.css and tailwind.config.ts.
 */

export const theme = {
  /* Layout */
  layout: {
    screen: "h-screen flex flex-col overflow-x-hidden",
    flexRow: "flex flex-col md:flex-row",
    flex1: "flex-1 min-h-0",
    scrollArea: "overflow-y-auto overflow-x-hidden flex flex-col items-center justify-start md:justify-center",
    containerPadding: "py-6 sm:py-8 px-4 sm:px-6 lg:px-8",
    contentPadding: "px-6 sm:px-8 lg:px-10",
    formBody: "py-6",
    maxWidth: {
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl",
      "2xl": "max-w-2xl",
    },
  },

  /* Surfaces (use theme colors) */
  surface: {
    page: "bg-muted-bg",
    panel: "bg-primary",
    panelGradient: "bg-gradient-to-b from-primary to-primary-hover",
    card: "bg-card rounded-2xl border border-border shadow-xl overflow-hidden",
    cardHeader: "border-b border-border",
    cardFooter: "border-t border-border",
    formSection: "rounded-xl border border-border bg-muted-bg/50",
  },

  /* Typography */
  text: {
    heading1: "text-xl font-bold text-foreground",
    heading2: "text-2xl font-bold tracking-tight",
    subtitle: "text-sm text-muted-foreground mt-1",
    body: "text-sm leading-relaxed",
    small: "text-xs font-medium",
    muted: "text-sm text-muted-foreground",
    mutedSmall: "text-xs text-muted-foreground",
    label: "block text-sm font-medium text-foreground mb-1.5",
    hint: "mt-1 text-xs text-muted-foreground",
    error: "mt-1.5 text-xs text-error role-alert",
    white: "text-white",
    whiteMuted: "text-primary-light",
    whiteSoft: "text-white/95",
  },

  /* Form controls */
  input: {
    base:
      "w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition text-sm",
    error: "border-error focus:ring-error/30 focus:border-error",
  },
  select: {
    base:
      "w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition text-sm",
  },
  label: "block text-sm font-medium text-foreground mb-1.5",

  /* Buttons */
  button: {
    base: "font-medium transition disabled:opacity-60 disabled:cursor-not-allowed",
    primary: "bg-primary hover:bg-primary-hover text-white",
    secondary: "bg-card text-foreground border border-border hover:border-primary hover:bg-muted-bg",
    ghost: "bg-card text-muted-foreground border border-border hover:border-primary/40 hover:bg-muted-bg",
    danger: "bg-error hover:bg-error-hover text-white",
    link: "text-muted-foreground hover:text-primary font-medium",
    linkMuted: "text-muted-foreground hover:text-primary",
    rounded: "rounded-xl",
    roundedLg: "rounded-lg",
    sizeMd: "py-3.5 px-4 text-sm",
    sizeSm: "py-2.5 px-4 text-sm",
    fullWidth: "w-full",
    submit: "w-full py-3.5 px-4 bg-primary hover:bg-primary-hover disabled:opacity-60 text-white font-semibold rounded-xl transition shadow-sm",
  },

  /* Auth-specific */
  auth: {
    screen: "h-screen flex flex-col md:flex-row overflow-x-hidden bg-muted-bg",
    panel: "hidden md:flex md:w-[40%] lg:w-[38%] flex-shrink-0 p-10 lg:p-12 flex-col justify-center shadow-xl",
    panelIcon: "w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center mb-6",
    panelIconMobile: "md:hidden w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4",
    panelBadge: "w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-xs font-medium shrink-0",
    panelList: "mt-8 space-y-3 text-sm",
    formArea: "flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col items-center justify-start md:justify-center py-6 sm:py-8 px-4 sm:px-6 lg:px-8 bg-muted-bg",
    formCard: "bg-card rounded-2xl shadow-xl border border-border overflow-hidden",
    formCardHeader: "px-6 sm:px-8 lg:px-10 pt-6 pb-4 border-b border-border",
    formCardBody: "py-6",
    formCardFooter: "px-6 sm:px-8 lg:px-10 pb-6 pt-4 flex flex-col items-center gap-2 text-center border-t border-border",
    link: "text-sm font-medium text-muted-foreground hover:text-primary transition",
    linkMuted: "text-sm font-medium text-muted-foreground/80 hover:text-primary transition",
    tabBar: "flex border-b border-border bg-muted-bg/70",
    tab: "flex-1 py-3.5 text-sm font-medium transition outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    tabActive: "text-primary border-b-2 border-primary -mb-px",
    tabInactive: "text-muted-foreground hover:text-foreground",
    roleButton: "flex-1 min-w-0 py-3 px-4 rounded-xl text-sm font-medium border transition",
    roleButtonActive: "bg-primary text-white border-primary",
    roleButtonInactive: "bg-card text-muted-foreground border-border hover:border-primary/40 hover:bg-muted-bg",
    alertError: "text-error text-sm bg-error-light border border-error px-4 py-3 rounded-xl",
    progressBar: "h-2 bg-muted-bg rounded-full overflow-hidden",
    progressFill: "h-full bg-primary rounded-full transition-all duration-300",
    stepText: "text-xs font-medium text-muted-foreground mb-2",
    stepTitle: "text-sm font-semibold text-foreground mt-2.5",
    wizardFooter: "px-6 sm:px-8 pb-6 flex gap-3",
    wizardStepHeader: "px-6 sm:px-8 pt-4 pb-2",
    wizardStepBody: "p-6 space-y-4",
    wizardBack: "py-2.5 px-4 rounded-lg border border-border text-foreground font-medium hover:bg-muted-bg transition",
    wizardNext: "py-2.5 px-5 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover disabled:opacity-50 transition",
    wizardRemoveBtn: "p-2.5 rounded-xl border border-border text-muted-foreground hover:bg-muted-bg shrink-0 transition",
    wizardAddLink: "text-sm text-primary font-medium hover:text-primary-hover transition",
  },

  /* Grid / spacing */
  grid: {
    formTwoCol: "grid grid-cols-1 sm:grid-cols-2 gap-4",
    formTwoColSm: "grid grid-cols-2 gap-3",
  },
  space: {
    formSection: "space-y-5 p-5 sm:p-6",
    formStack: "space-y-4",
    formStackSm: "space-y-2",
    formGroup: "space-y-4",
    formGroups: "space-y-8",
  },
  /* Section label (e.g. "Your details") */
  sectionLabel: "text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block",
  /* Section block: subtle container for form groups */
  sectionBlock: "rounded-xl border border-border/80 bg-muted-bg/40 p-4 sm:p-5",

  /* Alerts */
  alert: {
    base: "rounded-xl border px-4 py-3 text-sm",
    success: "bg-success-light border-success/30 text-success",
    warning: "bg-warning-light border-warning/30 text-warning",
    error: "bg-error-light border-error text-error",
    info: "bg-info-light border-info/30 text-info",
    default: "bg-muted-bg border-border text-foreground",
  },

  /* Layout – container */
  container: {
    base: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
    narrow: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8",
    wide: "max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8",
  },

  /* Nav */
  navLink: {
    base: "px-4 py-2 rounded-lg text-sm font-medium transition",
    active: "bg-primary-light text-primary",
    inactive: "text-muted-foreground hover:bg-muted-bg hover:text-foreground",
  },

  /* Footer */
  footer: {
    root: "bg-foreground text-muted-foreground mt-24",
    section: "py-14",
    heading: "font-semibold text-card mb-4",
    link: "text-sm text-muted-foreground/90 hover:text-primary-light transition",
    bottom: "mt-14 pt-8 border-t border-white/10 text-center text-sm text-muted-foreground/70",
  },

  /* Divider */
  divider: {
    horizontal: "border-t border-border",
    withLabel: "flex items-center gap-3 text-sm text-muted-foreground",
    line: "flex-1 border-t border-border",
  },
} as const;

export type Theme = typeof theme;
