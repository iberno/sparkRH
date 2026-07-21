/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/preline/dist/*.js',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        spark: {
          primary: '#1a1a2e',
          secondary: '#16213e',
          accent: '#e94560',
          gold: '#f5a623',
          light: '#f8f9fa',
        },
      },
    },
  },
  plugins: [require('preline/plugin')],
};
