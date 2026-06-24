import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-elev': 'var(--bg-elev)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        accent: 'var(--accent)',
        'accent-press': 'var(--accent-press)',
        'accent-soft': 'var(--accent-soft)',
        text: 'var(--text)',
        'text-2': 'var(--text-2)',
        'text-3': 'var(--text-3)',
        'text-4': 'var(--text-4)',
        danger: 'var(--danger)',
        amber: 'var(--amber)',
        hairline: 'var(--hairline)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        display: ['var(--font-display)', 'sans-serif'],
      },
      borderRadius: {
        sm: '10px',
        md: '14px',
        lg: '18px',
        xl: '24px',
      },
    },
  },
  plugins: [],
};

export default config;
