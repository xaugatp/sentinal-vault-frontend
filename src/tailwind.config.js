/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          base:   '#0f0f11',
          raised: '#141416',
          input:  '#18181e',
        },
        accent: {
          blue:   '#6ea8fe',
          'blue-dim': '#1c3a6e',
          green:  '#4ade80',
          'green-dim': '#0e2a1a',
        },
        border: {
          dim:    '#1e1e28',
          base:   '#28282e',
          accent: '#2a5090',
        }
      }
    }
  },
  plugins: []
}