import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    screens: {
      'xs': '480px',     // Extra small devices
      'sm': '640px',     // Small devices (標準と同じ)
      'md': '768px',     // Medium devices (標準と同じ)
      'lg': '1024px',    // Large devices (標準と同じ)
      'xl': '1280px',    // Extra large devices (標準と同じ)
      '2xl': '1536px',   // 2X Extra large devices (標準と同じ)
      '3xl': '1920px',   // 3X Extra large devices (新規追加)
      '4xl': '2560px',   // 4K displays (新規追加)
      'player-md': '1100px', // プレーヤー用のカスタムブレークポイント
      'player-lg': '1400px', // プレーヤー用の大きめのブレークポイント
    },
    container: {
      center: true,
      padding: 'xs:1rem', // 必要に応じてパディングを設定
      screens: {       
        sm: '1200px',        
        xl: '1280px',
        '2xl': '1536px',
        // 各ブレークポイントごとにカスタムのmax-widthを設定
        '3xl': '1920px',
        '4xl': '2560px',
      },
    },
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        "primary-hover": "var(--primary-hover)",
        secondary: "var(--secondary)",
        "secondary-hover": "var(--secondary-hover)",
        accent: "var(--accent)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
} satisfies Config;
