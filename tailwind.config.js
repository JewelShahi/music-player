/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          1: "#0f0a0a",
          2: "#161010",
          3: "#211616",
          4: "#2b1c1c",
        },

        /* Crimson Theme */
        accent: {
          DEFAULT: "#dc2626", // crimson red
          light: "#ef4444",
          dark: "#991b1b",
        },
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
    themes: [
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
    ],

    darkTheme: "crimson",
  },
};