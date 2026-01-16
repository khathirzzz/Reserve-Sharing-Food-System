/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        parchment: "#F7F2E8",
        cream: "#FFF7ED",
        sand: "#E7DCCB",
        cocoa: "#2F2A25",
        clay: "#6F6257",
        amber: {
          50: "#FFF3E1",
          100: "#FDE8CE",
          200: "#F7CFA6",
          300: "#F1B476",
          400: "#E69A4A",
          500: "#E18A2F",
          600: "#C8741D",
          700: "#A75E17",
          DEFAULT: "#E18A2F",
        },
        sage: {
          100: "#E9F0E1",
          200: "#CFE0BF",
          300: "#B5CF9D",
          400: "#92B176",
          500: "#6F8A5A",
          600: "#5B714A",
          700: "#495C3D",
          DEFAULT: "#6F8A5A",
        },
      },
      borderRadius: {
        card: "18px",
      },
      boxShadow: {
        card: "0 12px 30px -22px rgba(79, 50, 20, 0.35), 0 6px 16px -12px rgba(79, 50, 20, 0.18)",
        soft: "0 8px 20px -16px rgba(79, 50, 20, 0.25)",
      },
      backgroundImage: {
        "hero-glow":
          "linear-gradient(135deg, #FFF3E1 0%, #F9E7CF 45%, #F3E8D6 100%)",
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        reserve: {
          primary: "#E18A2F",
          secondary: "#6F8A5A",
          accent: "#F3C084",
          neutral: "#2F2A25",
          "base-100": "#FFF7ED",
          "base-200": "#F7F2E8",
          "base-300": "#E7DCCB",
          info: "#7E9DBB",
          success: "#6F8A5A",
          warning: "#E6A84C",
          error: "#D4553F",
        },
      },
    ],
    darkTheme: "reserve",
  },
}
