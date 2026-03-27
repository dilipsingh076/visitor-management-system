import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
      },
      transitionDuration: {
        DEFAULT: "150ms",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.2s ease-out",
        "slide-in-left": "slideInLeft 0.2s ease-out",
        "slide-in-right": "slideInRight 0.2s ease-out",
        "scale-in": "scaleIn 0.12s ease-out",
        "fade-in-up": "fadeInUp 0.2s ease-out",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(6px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        slideInLeft: { "0%": { opacity: "0", transform: "translateX(-8px)" }, "100%": { opacity: "1", transform: "translateX(0)" } },
        slideInRight: { "0%": { opacity: "0", transform: "translateX(8px)" }, "100%": { opacity: "1", transform: "translateX(0)" } },
        scaleIn: { "0%": { opacity: "0", transform: "scale(0.96)" }, "100%": { opacity: "1", transform: "scale(1)" } },
        fadeInUp: { "0%": { opacity: "0", transform: "translateY(4px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
      colors: {
        primary: {
          DEFAULT: "var(--color-primary, #059669)",
          hover: "var(--color-primary-hover, #047857)",
          light: "var(--color-primary-light, #d1fae5)",
          muted: "var(--color-primary-muted, #ecfdf5)",
          dark: "var(--color-primary-dark, #047857)",
          50: "var(--color-primary-50, #ecfdf5)",
        },
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        muted: "var(--color-muted)",
        "muted-foreground": "var(--color-muted-foreground)",
        "muted-bg": "var(--color-muted-bg)",
        border: "var(--color-border)",
        "border-subtle": "var(--color-border-subtle)",
        card: "var(--color-card)",
        "surface-raised": "var(--color-surface-raised)",
        "surface-sunken": "var(--color-surface-sunken)",
        success: {
          DEFAULT: "var(--color-success, #059669)",
          light: "var(--color-success-light)",
        },
        warning: {
          DEFAULT: "var(--color-warning, #d97706)",
          hover: "var(--color-warning-hover, #ca8a04)",
          light: "var(--color-warning-light)",
        },
        error: {
          DEFAULT: "var(--color-error, #dc2626)",
          hover: "var(--color-error-hover, #dc2626)",
          light: "var(--color-error-light)",
        },
        info: {
          DEFAULT: "var(--color-info, #3b82f6)",
          light: "var(--color-info-light)",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm, 0.25rem)",
        md: "var(--radius-md, 0.375rem)",
        lg: "var(--radius-lg, 0.5rem)",
        xl: "var(--radius-xl, 0.75rem)",
        "2xl": "var(--radius-2xl, 1rem)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        soft: "0 2px 8px rgba(0, 0, 0, 0.3)",
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        dropdown: "var(--shadow-dropdown)",
        sidebar: "var(--shadow-sidebar)",
        "input-focus": "var(--shadow-input-focus)",
      },
    },
  },
  plugins: [],
};

export default config;
