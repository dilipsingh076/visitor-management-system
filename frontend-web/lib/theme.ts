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
    page: "bg-surface-sunken",
    panel: "bg-primary",
    panelGradient: "bg-gradient-to-br from-primary via-primary to-primary-dark",
    card: "bg-card rounded-xl border border-border/60 shadow-[var(--shadow-card)] overflow-hidden",
    cardHeader: "border-b border-border/60",
    cardFooter: "border-t border-border/60",
    formSection: "rounded-xl border border-border/60 bg-muted-bg/30",
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
      "w-full px-4 py-3 rounded-xl border border-border/70 bg-card text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:shadow-[var(--shadow-input-focus)] outline-none transition-all duration-200 text-sm",
    error: "border-error/70 focus:ring-error/20 focus:border-error",
  },
  select: {
    base:
      "w-full px-4 py-3 rounded-xl border border-border/70 bg-card text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:shadow-[var(--shadow-input-focus)] outline-none transition-all duration-200 text-sm",
  },
  label: "block text-sm font-medium text-foreground mb-1.5",

  /* Buttons */
  button: {
    base: "font-medium transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed",
    primary: "bg-primary hover:bg-primary-hover text-white shadow-[var(--shadow-button)] hover:shadow-[var(--shadow-button-hover)] hover:-translate-y-px",
    secondary: "bg-card text-foreground border border-border/70 hover:border-primary/40 hover:bg-primary-50 hover:text-primary",
    ghost: "bg-transparent text-muted-foreground hover:bg-muted-bg hover:text-foreground",
    danger: "bg-error hover:bg-error-hover text-white shadow-sm",
    link: "text-muted-foreground hover:text-primary font-medium",
    linkMuted: "text-muted-foreground hover:text-primary",
    rounded: "rounded-xl",
    roundedLg: "rounded-lg",
    sizeMd: "py-3.5 px-4 text-sm",
    sizeSm: "py-2.5 px-4 text-sm",
    fullWidth: "w-full",
    submit: "w-full py-3.5 px-4 bg-primary hover:bg-primary-hover disabled:opacity-60 text-white font-semibold rounded-xl transition-all shadow-[var(--shadow-button)] hover:shadow-[var(--shadow-button-hover)]",
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
    formCard: "bg-card rounded-2xl shadow-xl border border-border/60 overflow-hidden",
    formCardHeader: "px-6 sm:px-8 lg:px-10 pt-6 pb-4 border-b border-border/60",
    formCardBody: "py-6",
    formCardFooter: "px-6 sm:px-8 lg:px-10 pb-6 pt-4 flex flex-col items-center gap-2 text-center border-t border-border/60",
    link: "text-sm font-medium text-muted-foreground hover:text-primary transition",
    linkMuted: "text-sm font-medium text-muted-foreground/80 hover:text-primary transition",
    tabBar: "flex border-b border-border/60 bg-muted-bg/70",
    tab: "flex-1 py-3.5 text-sm font-medium transition outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    tabActive: "text-primary border-b-2 border-primary -mb-px",
    tabInactive: "text-muted-foreground hover:text-foreground",
    roleButton: "flex-1 min-w-0 py-3 px-4 rounded-xl text-sm font-medium border transition-all duration-200",
    roleButtonActive: "bg-primary text-white border-primary shadow-[var(--shadow-button)]",
    roleButtonInactive: "bg-card text-muted-foreground border-border/70 hover:border-primary/40 hover:bg-primary-50",
    alertError: "text-error text-sm bg-error-light border border-error/50 px-4 py-3 rounded-xl",
    progressBar: "h-2 bg-muted-bg rounded-full overflow-hidden",
    progressFill: "h-full bg-primary rounded-full transition-all duration-300",
    stepText: "text-xs font-medium text-muted-foreground mb-2",
    stepTitle: "text-sm font-semibold text-foreground mt-2.5",
    wizardFooter: "px-6 sm:px-8 pb-6 flex gap-3",
    wizardStepHeader: "px-6 sm:px-8 pt-4 pb-2",
    wizardStepBody: "p-6 space-y-4",
    wizardBack: "py-2.5 px-4 rounded-lg border border-border/70 text-foreground font-medium hover:bg-muted-bg transition",
    wizardNext: "py-2.5 px-5 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover disabled:opacity-50 transition shadow-[var(--shadow-button)]",
    wizardRemoveBtn: "p-2.5 rounded-xl border border-border/70 text-muted-foreground hover:bg-muted-bg shrink-0 transition",
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
  sectionLabel: "text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block",
  sectionTitle: "text-base font-semibold text-foreground",
  sectionBlock: "rounded-xl border border-border/60 bg-muted-bg/30 p-4 sm:p-5",

  /* Alerts */
  alert: {
    base: "rounded-xl border px-4 py-3 text-sm shadow-xs",
    success: "bg-success-light border-success/30 text-success",
    warning: "bg-warning-light border-warning/30 text-warning",
    error: "bg-error-light border-error text-error",
    info: "bg-info-light border-info/30 text-info",
    default: "bg-muted-bg border-border text-foreground",
  },

  /* Container */
  container: {
    base: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
    narrower: "max-w-lg mx-auto px-4 sm:px-6 py-6",
    narrow: "max-w-4xl mx-auto px-4 sm:px-6 py-6",
    wide: "max-w-6xl mx-auto px-4 sm:px-6 py-6",
    "wide-xl": "max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8",
  },

  /* Stat cards */
  statCard: {
    root: "bg-card rounded-xl border border-border/60 p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-200 card-interactive",
    rootGradientPrimary: "bg-gradient-to-br from-primary to-primary-dark text-white rounded-xl p-5 shadow-lg",
    rootGradientWarning: "bg-gradient-to-br from-warning to-amber-600 text-white rounded-xl p-5 shadow-lg",
    rootGradientSuccess: "bg-gradient-to-br from-success to-emerald-700 text-white rounded-xl p-5 shadow-lg",
    rootGradientInfo: "bg-gradient-to-br from-info to-blue-700 text-white rounded-xl p-5 shadow-lg",
    iconWrap: "w-10 h-10 rounded-lg flex items-center justify-center",
    iconDefault: "bg-muted-bg text-muted-foreground",
    iconPrimary: "bg-primary/10 text-primary",
    iconWarning: "bg-warning/10 text-warning",
    iconSuccess: "bg-success/10 text-success",
    label: "text-muted-foreground text-xs font-medium",
    value: "text-2xl font-bold text-foreground mt-1",
    valueWhite: "text-2xl font-bold text-white mt-1",
    valueSuccess: "text-lg font-semibold text-success",
    valueInfo: "text-lg font-semibold text-info",
    valueWarning: "text-lg font-semibold text-warning",
  },

  /* Table */
  table: {
    wrap: "overflow-x-auto bg-card rounded-xl border border-border/60 shadow-[var(--shadow-card)]",
    thead: "bg-muted-bg/40 border-b border-border/60",
    th: "text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider",
    tbody: "divide-y divide-border/40",
    td: "px-4 py-3 text-sm",
    rowHover: "hover:bg-primary-50/50 transition-colors duration-150",
  },

  /* Status badge */
  statusBadge: {
    pending: "bg-warning-light text-warning border border-warning/20",
    approved: "bg-info-light text-info border border-info/20",
    checked_in: "bg-success-light text-success border border-success/20",
    checked_out: "bg-muted-bg text-muted-foreground border border-border",
    cancelled: "bg-error-light text-error border border-error/20",
    default: "bg-muted-bg text-muted-foreground border border-border",
  },

  /* Filter pills */
  filterPill: {
    base: "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
    active: "bg-primary text-white border-primary shadow-sm",
    inactive: "bg-card text-muted border-border/60 hover:border-primary/40 hover:text-primary",
    pending: "bg-warning-light text-warning border-warning/30",
    approved: "bg-info-light text-info border-info/30",
    checked_in: "bg-primary-light text-primary border-primary/30",
  },

  /* Loading skeleton */
  loading: {
    page: "animate-pulse space-y-3",
    line: "h-6 bg-muted-bg rounded w-40",
    input: "h-9 bg-muted-bg rounded",
    block: "h-14 bg-muted-bg rounded-lg",
    card: "h-72 bg-muted-bg rounded-lg",
  },

  /* List */
  list: {
    card: "bg-card rounded-xl border border-border/60 overflow-hidden divide-y divide-border/40 shadow-[var(--shadow-card)]",
    rowHover: "hover:bg-primary-50/30 transition-colors duration-150",
    rowHoverLight: "hover:bg-muted-bg/30",
  },

  /* Nav */
  navLink: {
    base: "px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200",
    active: "bg-primary/10 text-primary font-semibold",
    inactive: "text-muted-foreground hover:bg-muted-bg/80 hover:text-foreground",
  },

  /* Sidebar */
  sidebar: {
    root: "hidden md:flex flex-col bg-card border-r border-border/60 shadow-[var(--shadow-sidebar)] transition-all duration-200",
    rootExpanded: "w-[var(--sidebar-width)]",
    rootCollapsed: "w-[var(--sidebar-collapsed-width)]",
    header: "h-14 flex items-center px-4 border-b border-border/60",
    nav: "flex-1 py-3 overflow-y-auto px-2",
    navItem: "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
    navItemActive: "bg-primary/10 text-primary font-semibold",
    navItemInactive: "text-muted-foreground hover:bg-muted-bg hover:text-foreground",
    navGroup: "mt-4 first:mt-0",
    navGroupLabel: "px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70",
    footer: "p-3 border-t border-border/60",
    overlay: "fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden",
    mobileDrawer: "fixed inset-y-0 left-0 z-50 w-64 bg-card shadow-xl transform transition-transform duration-300 md:hidden",
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
    horizontal: "border-t border-border/60",
    withLabel: "flex items-center gap-3 text-sm text-muted-foreground",
    line: "flex-1 border-t border-border/60",
  },
} as const;

export type Theme = typeof theme;
