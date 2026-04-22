/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sportz: {
          bg: "#06080d",
          surface: "#0d1117",
          elevated: "#161b22",
          border: "#21262d",
          live: "#00ff87",
          scheduled: "#ffb800",
          finished: "#484f58",
          text: "#f0f6fc",
          "text-secondary": "#8b949e",
        },
      },
      fontFamily: {
        display: ["Chakra Petch", "sans-serif"],
        body: ["Barlow", "sans-serif"],
        score: ["Teko", "sans-serif"],
        mono: ["Share Tech Mono", "monospace"],
      },
      animation: {
        "pulse-dot": "pulse-dot 1.5s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2.5s ease-in-out infinite",
      },
      keyframes: {
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        "glow-pulse": {
          "0%, 100%": {
            boxShadow:
              "0 0 20px rgba(0, 255, 135, 0.12), 0 0 40px rgba(0, 255, 135, 0.04)",
          },
          "50%": {
            boxShadow:
              "0 0 30px rgba(0, 255, 135, 0.22), 0 0 60px rgba(0, 255, 135, 0.08)",
          },
        },
      },
    },
  },
  plugins: [],
};
