/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],

  theme: {
    extend: {
      colors: {
        /* DaisyUI mapped variables */
        surface: {
          1: "var(--b1)",
          2: "var(--b2)",
          3: "var(--b3)",
          4: "var(--n)",
        },

        accent: {
          DEFAULT: "var(--p)",
          light: "var(--pc)",
          dark: "var(--pf)",
        },

        secondary: "var(--s)",
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
        eqBounce: {
          "0%": { height: "3px" },
          "100%": { height: "16px" },
        },

        fadeUp: {
          from: {
            opacity: 0,
            transform: "translateY(8px)",
          },
          to: {
            opacity: 1,
            transform: "translateY(0)",
          },
        },

        slideUp: {
          from: {
            transform: "translateY(100%)",
          },
          to: {
            transform: "translateY(0)",
          },
        },
      },
    },
  },

  plugins: [require("daisyui")],

  daisyui: {
    darkTheme: "crimson",

    themes: [
      /* ───────── Crimson ───────── */
      {
        crimson: {
          primary: "#dc2626",
          "primary-content": "#ffffff",
          "primary-focus": "#b91c1c",

          secondary: "#ef4444",
          accent: "#f87171",

          neutral: "#140909",

          "base-100": "#0b0505",
          "base-200": "#120808",
          "base-300": "#1b0d0d",

          "base-content": "#f5e7e7",

          info: "#f87171",
          success: "#22c55e",
          warning: "#f59e0b",
          error: "#ef4444",
        },
      },

      /* ───────── Forest ───────── */
      {
        forest: {
          primary: "#10b981",
          "primary-content": "#ffffff",
          "primary-focus": "#059669",

          secondary: "#34d399",
          accent: "#6ee7b7",

          neutral: "#0d1a14",

          "base-100": "#050b08",
          "base-200": "#0a120d",
          "base-300": "#101b14",

          "base-content": "#d7f5e5",

          info: "#2dd4bf",
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
        },
      },

      /* ───────── Ocean ───────── */
      {
        ocean: {
          primary: "#0891b2",
          "primary-content": "#ffffff",
          "primary-focus": "#0e7490",

          secondary: "#06b6d4",
          accent: "#67e8f9",

          neutral: "#09161a",

          "base-100": "#04090b",
          "base-200": "#091116",
          "base-300": "#101a20",

          "base-content": "#d8edf2",

          info: "#22d3ee",
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
        },
      },

      /* ───────── Midnight ───────── */
      {
        midnight: {
          primary: "#7c3aed",
          "primary-content": "#ffffff",
          "primary-focus": "#6d28d9",

          secondary: "#8b5cf6",
          accent: "#a78bfa",

          neutral: "#141420",

          "base-100": "#09090f",
          "base-200": "#101018",
          "base-300": "#181824",

          "base-content": "#ebe9ff",

          info: "#818cf8",
          success: "#22c55e",
          warning: "#f59e0b",
          error: "#ef4444",
        },
      },
    ],
  },
};