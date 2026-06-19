/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: { center: true },
    extend: {
      colors: {
        mint: { DEFAULT: "#6FF0B6", dark: "#3DBF8C", light: "#A8FFD8" },
        ink: { DEFAULT: "#0A1620", light: "#122433", lighter: "#1B3346" },
        danger: "#FF5C7A",
        gold: "#FFD66B",
        willow: "#B07CFF",
        amber: "#FFAA33",
        rope: "#FFD66B",
      },
      fontFamily: {
        display: ['"ZCOOL KuaiLe"', "cursive"],
        body: ['"Noto Sans SC"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      boxShadow: {
        "mint-glow": "0 0 20px rgba(111,240,182,0.4)",
        "mint-glow-lg": "0 0 40px rgba(111,240,182,0.6)",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseGlow: {
          "0%,100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        shake: {
          "0%,100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-6px)" },
          "75%": { transform: "translateX(6px)" },
        },
        flipIn: {
          "0%": { transform: "rotateY(180deg)", opacity: "0" },
          "100%": { transform: "rotateY(0)", opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        hitFlash: {
          "0%": { filter: "brightness(2.5) saturate(1.5)" },
          "100%": { filter: "brightness(1) saturate(1)" },
        },
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        pulseGlow: "pulseGlow 2.5s ease-in-out infinite",
        shake: "shake 0.3s ease-in-out",
        flipIn: "flipIn 0.45s ease-out",
        slideUp: "slideUp 0.3s ease-out",
        hitFlash: "hitFlash 0.25s ease-out",
      },
    },
  },
  plugins: [],
};
