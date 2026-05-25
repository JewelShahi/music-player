/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: { 1: "#0c0c16", 2: "#111119", 3: "#1a1a26", 4: "#22222f" },
        accent: { DEFAULT: "#8b5cf6", light: "#a78bfa", dark: "#6d28d9" },
      },
      animation: {
        "eq-1": "eqBounce .6s ease-in-out infinite alternate",
        "eq-2": "eqBounce .6s .15s ease-in-out infinite alternate",
        "eq-3": "eqBounce .6s .3s ease-in-out infinite alternate",
        "eq-4": "eqBounce .6s .07s ease-in-out infinite alternate",
        "fade-up": "fadeUp .35s ease both",
        "slide-up": "slideUp .35s cubic-bezier(.4,0,.2,1) both",
      },
      keyframes: {
        eqBounce: { "0%": { height: "3px" }, "100%": { height: "16px" } },
        fadeUp: { from: { opacity: 0, transform: "translateY(8px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        slideUp: { from: { transform: "translateY(100%)" }, to: { transform: "translateY(0)" } },
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        crimson: {
          "primary": "#e11d48",
          "primary-content": "#ffffff",
          "primary-focus": "#be123c",
          "secondary": "#f43f5e",
          "accent": "#fb7185",
          "neutral": "#1f0a12",
          "base-100": "#0e0608",
          "base-200": "#150a0e",
          "base-300": "#1f1015",
          "base-content": "#f1e2e6",
          "info": "#fb7185",
          "success": "#34d399",
          "warning": "#fbbf24",
          "error": "#ef4444",
        },
      },
      
    ],
    darkTheme: "crimson",
  },
};