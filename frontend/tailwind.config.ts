import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0F14",
        surface: "#111827",
        card: "#1F2937",
        border: "#374151",
        "border-subtle": "#1F2937",
        accent: {
          DEFAULT: "#6366F1",
          hover: "#4F46E5",
          muted: "#6366F120",
        },
        success: {
          DEFAULT: "#10B981",
          muted: "#10B98120",
        },
        warning: {
          DEFAULT: "#F59E0B",
          muted: "#F59E0B20",
        },
        danger: {
          DEFAULT: "#EF4444",
          muted: "#EF444420",
        },
        muted: {
          DEFAULT: "#6B7280",
          foreground: "#9CA3AF",
        },
        foreground: {
          DEFAULT: "#F9FAFB",
          muted: "#9CA3AF",
          subtle: "#6B7280",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        "2xs": "0.65rem",
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.5)",
        glow: "0 0 20px rgba(99,102,241,0.15)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-in": "slideIn 0.25s ease-out",
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-8px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
