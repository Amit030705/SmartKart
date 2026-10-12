/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        xl: '0.5rem',
        '2xl': '0.625rem',
        '3xl': '0.75rem',
      },
      colors: {
        sky: {
          50: '#f3f6f2', 100: '#e7eee5', 200: '#d1dfce', 300: '#b2c7ae',
          400: '#8eaa8b', 500: '#6f906e', 600: '#557a5b', 700: '#426449',
          800: '#354f3b', 900: '#2b4031', 950: '#17271c',
        },
        teal: {
          50: '#f4f6f1', 100: '#e9eee3', 200: '#d5dfc9', 300: '#b9cba6',
          400: '#96ae7c', 500: '#78965e', 600: '#5e7b49', 700: '#4c633c',
          800: '#3d5032', 900: '#303f29',
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        electric: {
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        navy: {
          800: '#1e293b',
          900: '#0f172a',
          950: '#090d16',
        },
        teal: {
          500: '#14b8a6',
          600: '#0d9488',
        }
      },
    },
  },
  plugins: [],
}
