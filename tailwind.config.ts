import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1f2937',
        secondary: '#6366f1',
        accent: '#ec4899'
      },
      backdropFilter: {
        'glass': 'blur(10px)'
      }
    }
  },
  plugins: []
};

export default config;
