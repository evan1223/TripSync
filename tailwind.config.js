import {heroui} from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      // 用法：className="text-h1" 
      fontSize: {
        h1: ['46px', { lineHeight: 'auto' }],
        h2: ['28px', { lineHeight: 'auto' }],
        h3: ['24px', { lineHeight: 'auto' }],
        h4: ['20px', { lineHeight: 'auto' }],
        p: ['16px', { lineHeight: 'auto' }],
      },
      // 用法：className="xx-primary-blue1" 
      colors:{
           // 請對照 figma 上顏色 
           // 【主色：藍色】按鈕、主標題、Logo 重點
          primary: {
            blue0: "#001F63", 
            blue1: "#0739A7",
            blue2: "#2563EB", // 主色
            blue3: "#6898FF",
            blue4: "#A9C4FF",
            blue5: "#E9F0FF",
          },
          // 強調色：橘色（CTA、icon）
          secondary: {
            orange0: "#712E00",
            orange1: "#B54A00",
            orange2: "#F97316", 
            orange3: "#FF9F5C",
            orange4: "#FFC8A2",
            orange5: "#FFF1E8",
          },

          // 背景灰、次文字色
          gray: {
            "1":"#6B7280",
            "2":"#A1A1AA",
            "3":"#E5E7EB",
            "4":"#F9FAFB",
          },
          // 主字色
          "black":"#111827",

          //狀態提醒色
          danger: '#FF5B5B', 
          success: '#45D483',
      }

    },
  },
  darkMode: "class",
  plugins: [heroui()],
}

module.exports = config;