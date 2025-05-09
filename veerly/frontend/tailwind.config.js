/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4caf50',
        'primary-dark': '#45a049',
        secondary: '#2196f3',
        'secondary-dark': '#0b7dda',
        warning: '#ff9800',
        'warning-dark': '#e68a00',
        danger: '#f44336',
        'danger-dark': '#d32f2f',
        success: '#4caf50',
        'success-dark': '#45a049',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'nav': '0 2px 10px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}

