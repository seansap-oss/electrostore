import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        volt: {
          DEFAULT: "#FFD600",
          dark: "#E6C100",
          soft: "#FFF6CC"
        },
        charcoal: {
          DEFAULT: "#151515",
          soft: "#232323",
          mute: "#626262"
        },
        paper: "#FFFFFF",
        mist: "#F6F6F4",
        success: "#1B7A3D",
        danger: "#D92D20",
        info: "#2456E6"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"]
      },
      borderRadius: {
        xl2: "1.25rem"
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.08)",
        pop: "0 12px 40px rgba(0,0,0,.18)"
      }
    }
  },
  plugins: []
};
export default config;
