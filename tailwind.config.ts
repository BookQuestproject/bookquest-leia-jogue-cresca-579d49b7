import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Source Sans 3', 'system-ui', 'sans-serif'],
        serif: ['Crimson Pro', 'Georgia', 'serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        bronze: "hsl(var(--bronze))",
        gold: "hsl(var(--gold))",
        sapphire: "hsl(var(--sapphire))",
        emerald: "hsl(var(--emerald))",
        amethyst: "hsl(var(--amethyst))",
        ruby: "hsl(var(--ruby))",
        diamond: "hsl(var(--diamond))",
        legendary: "hsl(var(--legendary))",
        olive: "hsl(var(--olive))",
        amber: "hsl(var(--amber))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        info: "hsl(var(--info))",
      },
      borderRadius: {
        lg: "calc(var(--radius) + 2px)",
        md: "var(--radius)",
        sm: "calc(var(--radius) - 2px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.9)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "bounce-gentle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "focus-breathe": {
          "0%, 100%": { transform: "scale(1) translate(0, 0)", opacity: "0.55" },
          "50%": { transform: "scale(1.08) translate(2%, -1%)", opacity: "0.75" },
        },
        "focus-drift-a": {
          "0%": { transform: "translate(0, 0)" },
          "25%": { transform: "translate(15px, -20px)" },
          "50%": { transform: "translate(-10px, -45px)" },
          "75%": { transform: "translate(20px, -70px)" },
          "100%": { transform: "translate(0, -100px)" },
        },
        "focus-drift-b": {
          "0%": { transform: "translate(0, 0)" },
          "33%": { transform: "translate(-25px, -15px)" },
          "66%": { transform: "translate(10px, -35px)" },
          "100%": { transform: "translate(-15px, -60px)" },
        },
        "focus-drift-c": {
          "0%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(30px, 20px)" },
          "100%": { transform: "translate(60px, -10px)" },
        },
        "focus-twinkle": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.35", transform: "scale(0.85)" },
        },
        "focus-glow-pulse": {
          "0%, 100%": { opacity: "0.85", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.04)" },
        },
        "focus-button-glow": {
          "0%, 100%": { boxShadow: "0 10px 30px -5px rgba(212, 175, 55, 0.35), 0 0 0 0 rgba(212, 175, 55, 0.0)" },
          "50%": { boxShadow: "0 10px 35px -5px rgba(212, 175, 55, 0.5), 0 0 0 8px rgba(212, 175, 55, 0.06)" },
        },
        "tutorial-card": {
          "0%": { opacity: "0", transform: "translateY(8px) scale(0.96)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "slide-in-left": "slide-in-left 0.4s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        "bounce-gentle": "bounce-gentle 2s ease-in-out infinite",
        "pulse": "pulse 2s ease-in-out infinite",
        "focus-breathe": "focus-breathe 18s ease-in-out infinite",
        "focus-drift-a": "focus-drift-a 50s ease-in-out infinite",
        "focus-drift-b": "focus-drift-b 60s ease-in-out infinite",
        "focus-drift-c": "focus-drift-c 70s ease-in-out infinite",
        "focus-twinkle": "focus-twinkle 10s ease-in-out infinite",
        "focus-glow-pulse": "focus-glow-pulse 4s ease-in-out infinite",
        "focus-button-glow": "focus-button-glow 3s ease-in-out infinite",
        "tutorial-card": "tutorial-card 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
