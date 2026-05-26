/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],

  theme: {
    extend: {
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
      /* ───────── Sunset ───────── */
      {
        sunset: {
          primary: "#f97316",
          "primary-content": "#ffffff",
          "primary-focus": "#ea580c",

          secondary: "#fb923c",
          accent: "#fdba74",

          neutral: "#1a0e06",

          "base-100": "#0a0500",
          "base-200": "#120900",
          "base-300": "#1c0f04",

          "base-content": "#fff0e5",

          info: "#fdba74",
          success: "#22c55e",
          warning: "#f59e0b",
          error: "#ef4444",
        },
      },

      /* ───────── Nord ───────── */
      {
        nord: {
          primary: "#3b82f6",
          "primary-content": "#ffffff",
          "primary-focus": "#2563eb",

          secondary: "#60a5fa",
          accent: "#93c5fd",

          neutral: "#080d14",

          "base-100": "#040810",
          "base-200": "#070d18",
          "base-300": "#0d1525",

          "base-content": "#e0eeff",

          info: "#38bdf8",
          success: "#22c55e",
          warning: "#f59e0b",
          error: "#ef4444",
        },
      },

      /* ───────── Sakura ───────── */
      {
        sakura: {
          primary: "#ec4899",
          "primary-content": "#ffffff",
          "primary-focus": "#db2777",

          secondary: "#f472b6",
          accent: "#f9a8d4",

          neutral: "#1a080e",

          "base-100": "#0b0408",
          "base-200": "#140610",
          "base-300": "#1e0a18",

          "base-content": "#ffe8f4",

          info: "#f9a8d4",
          success: "#22c55e",
          warning: "#f59e0b",
          error: "#ef4444",
        },
      },

      /* ───────── Fuchsia ───────── */
      {
        fuchsia: {
          primary: "#d946ef",
          "primary-content": "#ffffff",
          "primary-focus": "#c026d3",

          secondary: "#e879f9",
          accent: "#f0abfc",

          neutral: "#1a0620",

          "base-100": "#0a0110",
          "base-200": "#110318",
          "base-300": "#1a0624",

          "base-content": "#fce7ff",

          info: "#f0abfc",
          success: "#22c55e",
          warning: "#f59e0b",
          error: "#ef4444",
        },
      },

      /* ───────── Aurora ───────── */
      {
        aurora: {
          primary: "#06b6d4",
          "primary-content": "#ffffff",
          "primary-focus": "#0891b2",

          secondary: "#818cf8",
          accent: "#34d399",

          neutral: "#060d12",

          "base-100": "#030708",
          "base-200": "#070e12",
          "base-300": "#0d1720",

          "base-content": "#d0f5f9",

          info: "#38bdf8",
          success: "#22c55e",
          warning: "#f59e0b",
          error: "#ef4444",
        },
      },

      /* ───────── Wine ───────── */
      {
        wine: {
          primary: "#9f1239",
          "primary-content": "#ffffff",
          "primary-focus": "#881337",
          secondary: "#be123c",
          accent: "#fb7185",
          neutral: "#12040a",
          "base-100": "#080205",
          "base-200": "#0f0409",
          "base-300": "#18060e",
          "base-content": "#ffe4ec",
          info: "#fb7185",
          success: "#22c55e",
          warning: "#f59e0b",
          error: "#ef4444",
        },
      },

      /* ───────── Cobalt ───────── */
      {
        cobalt: {
          primary: "#1740cf",
          "primary-content": "#ffffff",
          "primary-focus": "#1e3a8a",
          secondary: "#3b5bdb",
          accent: "#748ffc",
          neutral: "#02040f",
          "base-100": "#01020a",
          "base-200": "#03050f",
          "base-300": "#060a1a",
          "base-content": "#dde3ff",
          info: "#748ffc",
          success: "#22c55e",
          warning: "#f59e0b",
          error: "#ef4444",
        },
      },

      /* ───────── Infrared ───────── */
      {
        infrared: {
          primary: "#ff2d55",
          "primary-content": "#ffffff",
          "primary-focus": "#c0152a",
          secondary: "#ff375f",
          accent: "#ff6b81",
          neutral: "#0f0105",
          "base-100": "#090103",
          "base-200": "#100206",
          "base-300": "#19030a",
          "base-content": "#ffe0e6",
          info: "#ff6b81",
          success: "#22c55e",
          warning: "#f59e0b",
          error: "#ef4444",
        },
      },
    ],
  },
};