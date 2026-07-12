/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        darkbg: "#0B0F19",
        darkcard: "rgba(22, 31, 48, 0.7)",
        glassborder: "rgba(255, 255, 255, 0.08)",
        navy: {
          50: "#f0f4f8",
          100: "#d9e2ec",
          200: "#bcccdc",
          300: "#9fb3c8",
          400: "#829ab1",
          500: "#627d98",
          600: "#486581",
          700: "#334e68",
          800: "#243e56",
          900: "#102a43",
        },
        emerald: {
          500: "#10b981",
          600: "#059669",
        },
        rose: {
          500: "#f43f5e",
          600: "#e11d48",
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"]
      },
      backdropBlur: {
        xs: "2px",
      }
    },
  },
  plugins: [],
};
