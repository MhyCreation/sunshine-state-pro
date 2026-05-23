import React from "react";
import { redirect } from "next/navigation";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { createClient } from "@/lib/localbase/server";
import { BackendTabBar } from "./tab-bar";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--strata-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--strata-mono",
  display: "swap",
});

export default async function BackendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lb = await createClient();
  const { data: user } = await lb.auth.getUser() as {
    data: { id: string } | null;
    error: unknown;
  };
  if (!user) redirect("/login");

  const cssVars: React.CSSProperties & Record<string, string> = {
    "--bg": "#0d0e10",
    "--bg-1": "#14161a",
    "--bg-2": "#1b1d22",
    "--bg-3": "#24272d",
    "--line": "#2e323a",
    "--line-soft": "#23262c",
    "--text": "#f4f3ec",
    "--text-dim": "#b0b3bb",
    "--text-mute": "#71757e",
    "--accent": "oklch(0.92 0.18 120)",
    "--accent-ink": "oklch(0.22 0.10 130)",
    "--danger": "oklch(0.78 0.18 25)",
    "--warn": "oklch(0.85 0.14 75)",
    "--info": "oklch(0.78 0.12 235)",
  };

  return (
    <div
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      style={{
        ...(cssVars as React.CSSProperties),
        background: "var(--bg)",
        color: "var(--text)",
        fontFamily: "var(--strata-sans), system-ui, sans-serif",
        minHeight: "100svh",
        position: "relative",
        maxWidth: 430,
        margin: "0 auto",
        overflow: "hidden",
      }}
    >
      <style>{`
        .strata-mono { font-family: var(--strata-mono, ui-monospace); }
        .strata-caps {
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-size: 10px;
          font-weight: 600;
          color: var(--text-mute);
        }
        @keyframes strata-pulse-anim {
          0%, 100% {
            box-shadow: 0 0 0 0 color-mix(in oklab, var(--accent) 40%, transparent);
          }
          50% {
            box-shadow: 0 0 0 4px color-mix(in oklab, var(--accent) 0%, transparent);
          }
        }
        .strata-pulse {
          animation: strata-pulse-anim 2s ease-in-out infinite;
        }
      `}</style>

      <div style={{ paddingBottom: 80 }}>{children}</div>

      <BackendTabBar />
    </div>
  );
}
