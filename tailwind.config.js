/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#F1F5F9", // slate-100 off-white
          alt: "#FFFFFF",
        },
        surface: "#FFFFFF",
        primary: {
          DEFAULT: "#0F172A", // Institutional Navy
          light: "#1E293B",
          dark: "#020617",
        },
        accent: {
          DEFAULT: "#0D9488", // Restrained teal
          light: "#14B8A6",
          dark: "#0F766E",
        },
        semantic: {
          success: "#16A34A", // green
          warning: "#D97706", // amber
          critical: "#DC2626", // red
          neutral: "#64748B", // gray
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'panel': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
