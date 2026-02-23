import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./web/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#6366F1', hover: '#4F46E5', light: '#E0E7FF' },
        background: '#FAFAF9',
        foreground: '#0f172a',
        muted: '#64748b',
        'muted-bg': '#f1f5f9',
        border: '#e2e8f0',
        card: '#ffffff',
        success: '#059669',
        warning: '#d97706',
        error: '#dc2626',
      },
      borderRadius: { sm: 8, md: 12, lg: 16 },
    },
  },
  plugins: [],
};

export default config;
