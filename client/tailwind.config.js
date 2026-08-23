/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          light: '#FBF5DD',
          sand: '#E7E1B1',
          green: '#306D29',
          dark: '#0D530E',
          50: '#FBF5DD',
          100: '#E7E1B1',
          500: '#306D29',
          600: '#255820',
          700: '#1b4317',
          800: '#0D530E',
          900: '#083709',
        }
      }
    },
  },
  plugins: [],
}
