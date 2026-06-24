module.exports = {
  content: [
    "./**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        'light-blue': {
          50: '#e8eef7',
          100: '#c4cfe5',
          200: '#91b7e4',
          300: '#6a9dd0',
          400: '#3a7eb9',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0064a0',
          800: '#004276',
          900: '#001f53',
        },
        'slate': {
          100: '#f8fafc',
          200: '#e2e8f0',
          300: '#cbd5e0',
          400: '#96a0a8',
          500: '#627280',
          600: '#414a58',
          700: '#2f3748',
          800: '#202630',
          900: '#1a202c',
        },
      },
    },
  },
  plugins: []
}