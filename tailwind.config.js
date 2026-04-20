/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        focus: '#ffffff', // Removed amber, using white
        active: '#ffffff', // Removed teal, using white
        slate: {
          800: '#181818', // Active state background
          900: '#111111', // Cards and panels
          950: '#0a0a0a'  // Main background
        }
      }
    },
  },
  plugins: [],
}
