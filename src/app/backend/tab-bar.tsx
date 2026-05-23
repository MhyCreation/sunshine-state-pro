"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const tabs = [
  {
    href: "/backend",
    label: "Status",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 11l9-7 9 7" />
        <path d="M5 10v10h14V10" />
      </svg>
    ),
  },
  {
    href: "/backend/tables",
    label: "Tables",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
        <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
      </svg>
    ),
  },
  {
    href: "/backend/users",
    label: "Users",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3l8 3v5c0 4.5-3.4 8.5-8 10-4.6-1.5-8-5.5-8-10V6l8-3z" />
      </svg>
    ),
  },
];

export function BackendTabBar() {
  const pathname = usePathname();

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        display: "flex",
        background: "rgba(13,14,16,0.85)",
        backdropFilter: "blur(20px) saturate(160%)",
        borderTop: "1px solid var(--line-soft)",
        paddingBottom: 28,
        paddingTop: 8,
        zIndex: 50,
      }}
    >
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              textDecoration: "none",
              position: "relative",
              paddingTop: 6,
            }}
          >
            {/* Active indicator bar */}
            {active && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 22,
                  height: 2,
                  borderRadius: 1,
                  background: "var(--accent)",
                }}
              />
            )}
            <span
              style={{
                color: active ? "var(--accent)" : "var(--text-mute)",
                display: "flex",
              }}
            >
              {tab.icon}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                color: active ? "var(--text)" : "var(--text-mute)",
                letterSpacing: "0.01em",
              }}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
