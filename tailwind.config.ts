import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./data/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Avenir Next", "ui-sans-serif", "system-ui"],
        display: ["Georgia", "Iowan Old Style", "ui-serif", "serif"]
      },
      colors: {
        ink: "#0b1020",
        chalk: "#f8fafc",
        pitch: "#12372a",
        gold: "#d6b15d",
        crimson: "#b91c3a",
        skyglass: "#dff6ff"
      },
      boxShadow: {
        glow: "0 0 60px rgba(214,177,93,.25)",
        panel: "0 24px 80px rgba(2,6,23,.18)"
      }
    }
  },
  plugins: []
};

export default config;
