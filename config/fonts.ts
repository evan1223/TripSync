import { Fira_Code as FontMono, Inter as FontSans } from "next/font/google";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap", // 先顯示備用字體，等字體載入後再替換
});

export const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
});
