import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "SunshineSpins — Free Sweepstakes Casino",
  description:
    "Play free sweepstakes slots, blackjack, poker & roulette. Win Sweeps Coins and redeem for prizes. No purchase necessary.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} dark`}>
      <body className="font-sans antialiased bg-casino-900 text-white">{children}</body>
    </html>
  );
}
