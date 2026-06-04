/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e', // Coral/rose pink
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
        },
        gold: {
          50: '#fdfbf7',
          100: '#fbf7ed',
          200: '#f4ebd2',
          300: '#ecdcb7',
          400: '#dcbe81',
          500: '#cca04c', // Gold
          600: '#b88a38',
          700: '#996e2a',
          800: '#7a5421',
          900: '#64431c',
          950: '#3a240e',
        },
        luxury: {
          cream: '#FCFAF6',
          rose: '#FFF0F0',
          dark: '#2E2224',
          gray: '#605255',
          lightgray: '#EFEAE6',
          lavender: '#F5EFF7',
          white: '#FFFFFF',
          card: '#FFFFFF',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'premium': '0 8px 30px rgba(244, 63, 94, 0.06)',
        'luxury': '0 12px 35px rgba(204, 160, 76, 0.1)',
        'glass': '0 8px 32px 0 rgba(46, 34, 36, 0.03)',
      }
    },
  },
  plugins: [],
}
