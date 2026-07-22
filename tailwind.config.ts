import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // Wellness Kraft palette — keep in sync with the CSS variables in
      // app/globals.css and client-feedback/Website-Color-Palette.pdf.
      colors: {
        olive: "#334720", // --deep-olive: logo, headings, primary buttons
        cream: "#FEFAEF", // --cream: main background, matches logo
        charcoal: "#1E1E1E", // --charcoal: body text
        sage: "#6B7A5E", // --muted-sage: secondary text, borders
        "soft-cream": "#F4F1E6", // --soft-cream: alternating section backgrounds
        "fresh-sage": "#8FA876", // --fresh-sage: hover states, secondary buttons
        turmeric: "#C98A3E", // --turmeric-gold: bestseller/featured tags ONLY
        alert: "#B23B3B", // --alert-red: errors, out-of-stock
        success: "#3D7A4E", // --success-green: order success, in-stock
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
