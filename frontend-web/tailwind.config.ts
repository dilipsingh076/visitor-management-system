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
        DEFAULT: "200ms",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(8px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
      colors: {
        primary: {
          DEFAULT: "var(--color-primary, #059669)",
          hover: "var(--color-primary-hover, #047857)",
          light: "var(--color-primary-light, #d1fae5)",
          muted: "var(--color-primary-muted, #ecfdf5)",
        },
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        muted: "var(--color-muted)",
        "muted-foreground": "var(--color-muted-foreground)",
        "muted-bg": "var(--color-muted-bg)",
        border: "var(--color-border)",
        card: "var(--color-card)",
        success: {
          DEFAULT: "var(--color-success, #059669)",
          light: "var(--color-success-light, #d1fae5)",
        },
        warning: {
          DEFAULT: "var(--color-warning, #d97706)",
          hover: "var(--color-warning-hover, #b45309)",
          light: "var(--color-warning-light, #fef3c7)",
        },
        error: {
          DEFAULT: "var(--color-error, #dc2626)",
          hover: "var(--color-error-hover, #b91c1c)",
          light: "var(--color-error-light, #fee2e2)",
        },
        info: {
          DEFAULT: "var(--color-info, #0284c7)",
          light: "var(--color-info-light, #e0f2fe)",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm, 0.5rem)",
        md: "var(--radius-md, 0.75rem)",
        lg: "var(--radius-lg, 1rem)",
        xl: "var(--radius-xl, 1.5rem)",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0, 0, 0, 0.06)",
        card: "0 4px 12px rgba(0, 0, 0, 0.08)",
        "card-hover": "0 8px 24px rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
