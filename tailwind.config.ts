import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#FFF8E1",
          100: "#FDECB3",
          200: "#FAE082",
          300: "#F7D451",
          400: "#F5C547",
          500: "#E5B032",
          600: "#D4A017",
          700: "#A77F11",
          800: "#7A5C0B",
          900: "#4D3A06",
        },
        casino: {
          950: "#06060B",
          900: "#0B0B15",
          800: "#11111E",
          700: "#181828",
          600: "#1F1F35",
          500: "#2A2A45",
          400: "#3D3D60",
          300: "#5A5A85",
        },
        felt: {
          900: "#0A2318",
          800: "#0F3222",
          700: "#154530",
          600: "#1A5A3E",
          500: "#1E6645",
        },
        win: {
          DEFAULT: "#22C55E",
          light: "#4ADE80",
          dark: "#16A34A",
        },
        lose: {
          DEFAULT: "#EF4444",
          light: "#F87171",
          dark: "#DC2626",
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
        "gradient-casino": "linear-gradient(135deg, #11111E 0%, #1F1F35 100%)",
        "gradient-felt": "linear-gradient(135deg, #0F3222 0%, #154530 100%)",
        "felt-texture":
          "radial-gradient(ellipse at 50% 50%, rgba(30,102,69,0.15) 0%, transparent 70%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        "spin-fast": "spin 0.3s linear infinite",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
        "bounce-win": "bounceWin 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97)",
        "reel-spin": "reelSpin 0.15s linear infinite",
        "float": "float 3s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 8px rgba(245,197,71,0.4)" },
          "50%": { boxShadow: "0 0 20px rgba(245,197,71,0.8)" },
        },
        bounceWin: {
          "0%, 100%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.15)" },
          "70%": { transform: "scale(0.95)" },
        },
        reelSpin: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        glow: {
          "0%": { textShadow: "0 0 8px rgba(245,197,71,0.5)" },
          "100%": { textShadow: "0 0 20px rgba(245,197,71,0.9), 0 0 40px rgba(245,197,71,0.4)" },
        },
      },
      boxShadow: {
        "gold-glow": "0 0 20px rgba(245,197,71,0.35)",
        "gold-glow-lg": "0 0 40px rgba(245,197,71,0.5)",
        "casino": "0 4px 24px rgba(0,0,0,0.6)",
        "card": "0 2px 12px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
