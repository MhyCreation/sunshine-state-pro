import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Sunshine State Pro brand
        navy: {
          50: "#E7EAF2",
          100: "#C2C9DB",
          200: "#9AA5C2",
          300: "#7281A8",
          400: "#4F6090",
          500: "#2D4079",
          600: "#1B2F66",
          700: "#13245A",
          800: "#0A1834", // primary
          900: "#050D1F",
        },
        gold: {
          50: "#FFF8E1",
          100: "#FDECB3",
          200: "#FAE082",
          300: "#F7D451",
          400: "#F5C547", // primary
          500: "#E5B032",
          600: "#D4A017", // accent
          700: "#A77F11",
          800: "#7A5C0B",
          900: "#4D3A06",
        },
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "6px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      backgroundImage: {
        "gradient-gold": "linear-gradient(135deg, #F5C547 0%, #D4A017 100%)",
        "gradient-navy": "linear-gradient(135deg, #0A1834 0%, #13245A 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
