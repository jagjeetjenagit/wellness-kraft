import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FAF7F1",
        cream: "#F3EDE2",
        sand: "#E7DFD0",
        ink: {
          DEFAULT: "#1B2823",
          soft: "#43524B",
          faint: "#6B7A72",
        },
        pine: {
          DEFAULT: "#0E6B4F",
          dark: "#0A523D",
          deep: "#123B2F",
          light: "#E4F1EA",
          mist: "#F1F7F3",
        },
        clay: {
          DEFAULT: "#C4633C",
          light: "#F7E9E1",
        },
        gold: "#C79A3B",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(27,40,35,0.06), 0 8px 24px -12px rgba(27,40,35,0.14)",
        lift: "0 2px 4px rgba(27,40,35,0.08), 0 16px 40px -16px rgba(27,40,35,0.24)",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "rise-1": "rise 0.6s ease-out both",
        "rise-2": "rise 0.6s 0.12s ease-out both",
        "rise-3": "rise 0.6s 0.24s ease-out both",
        "rise-4": "rise 0.6s 0.36s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
