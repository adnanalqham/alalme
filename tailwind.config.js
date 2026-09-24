/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './context/**/*.{js,ts,jsx,tsx}',
    './layouts/**/*.{js,ts,jsx,tsx}',
    './services/**/*.{js,ts,jsx,tsx}',
    './api/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#010736',
        navy: '#22396F',
        secondary: '#FCF1D0',
        cream: '#FCF1D0',
        surface: '#F3F5FA',
        success: '#15803D',
        warning: '#B45309',
        danger: '#DC2626',
        info: '#1D4ED8',
      },
      fontFamily: {
        sans: ['Thmanyah Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        cairo: ['Thmanyah Sans', 'sans-serif'],
        thmanyah: ['Thmanyah Sans', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
 boxShadow: {
 card: '0 1px 2px rgba(1,7,54,0.05), 0 4px 12px rgba(1,7,54,0.06)',
 'card-hover': '0 2px 4px rgba(1,7,54,0.08), 0 10px 24px rgba(1,7,54,0.12)',
 },
 },
 },
 plugins: [],
};
