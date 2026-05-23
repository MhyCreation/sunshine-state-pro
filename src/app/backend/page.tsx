import React from "react";
import {
  serverHealth,
  studioTables,
  studioAuthUsers,
  studioSql,
} from "@/lib/localbase/studio-fetch";

// ── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ── Sub-components ────────────────────────────────────────────────────────────

function AppHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle: string;
  right?: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: "16px 18px 14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--line-soft)",
      }}
    >
      <div>
        <div
          className="strata-caps"
          style={{ marginBottom: 6, color: "var(--text-mute)" }}
        >
          {subtitle}
        </div>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 500,
            margin: 0,
            color: "var(--text)",
          }}
        >
          {title}
        </h1>
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

function SectionTitle({
  label,
  action,
}: {
  label: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: "20px 18px 8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <span className="strata-caps">{label}</span>
      {action && <span>{action}</span>}
    </div>
  );
}

function MobStat({
  label,
  value,
  delta,
}: {
  label: string;
  value: string | number;
  delta?: string;
}) {
  return (
    <div
      style={{
        padding: "12px 14px",
        background: "var(--bg-1)",
        border: "1px solid var(--line-soft)",
        borderRadius: 6,
      }}
    >
      <div
        className="strata-caps"
        style={{ fontSize: 9.5, marginBottom: 6 }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 500,
          letterSpacing: "-0.02em",
          color: "var(--text)",
        }}
      >
        {value}
      </div>
      {delta && (
        <div
          className="strata-mono"
          style={{ fontSize: 10.5, color: "var(--text-mute)", marginTop: 2 }}
        >
          {delta}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

interface BusinessRow {
  name: string;
  created_at: string;
}

interface CountRow {
  c: number;
}

export default async function BackendPage() {
  const [health, tables, users, bizCountResult, recentBizResult] =
    await Promise.all([
      serverHealth(),
      studioTables(),
      studioAuthUsers(),
      studioSql<CountRow>("SELECT COUNT(*) as c FROM businesses"),
      studioSql<BusinessRow>(
        "SELECT name, created_at FROM businesses ORDER BY created_at DESC LIMIT 5",
      ),
    ]);

  const online = health !== null;
  const tableCount = tables.length;
  const userCount = users.length;
  const bizCount = bizCountResult?.rows?.[0]?.c ?? 0;
  const recentBiz: BusinessRow[] = recentBizResult?.rows ?? [];

  const checkedAgo = health
    ? timeAgo(health.timestamp)
    : "—";

  return (
    <>
      <AppHeader
        title="Platform"
        subtitle="localbase · default project"
        right={
          <div style={{ position: "relative", display: "inline-flex" }}>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-dim)"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {/* yellow dot */}
            <span
              style={{
                position: "absolute",
                top: 1,
                right: 1,
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--warn)",
              }}
            />
          </div>
        }
      />

      {/* Health pill */}
      <div style={{ padding: "18px 18px 0" }}>
        <div
          style={{
            border:
              "1px solid color-mix(in oklab, var(--accent) 25%, var(--line))",
            background:
              "color-mix(in oklab, var(--accent) 6%, var(--bg-1))",
            borderRadius: 8,
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {/* Pulse dot */}
          <span
            className={online ? "strata-pulse" : undefined}
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              flexShrink: 0,
              background: online ? "var(--accent)" : "var(--danger)",
            }}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--text)",
                marginBottom: 2,
              }}
            >
              {online ? "All systems operational" : "Server offline"}
            </div>
            <div
              className="strata-mono"
              style={{ fontSize: 11, color: "var(--text-mute)" }}
            >
              {online
                ? `checked ${checkedAgo} · localbase`
                : "cannot reach localbase server"}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <SectionTitle label="Stats" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          padding: "0 18px",
        }}
      >
        <MobStat label="Tables" value={tableCount} />
        <MobStat label="Auth users" value={userCount} />
        <MobStat label="Businesses" value={bizCount} />
        <MobStat label="Uptime" value="99.9%" />
      </div>

      {/* Recent registrations */}
      <SectionTitle label="Recent registrations" />
      <div style={{ padding: "0 18px" }}>
        {recentBiz.length === 0 ? (
          <div
            className="strata-mono"
            style={{
              color: "var(--text-mute)",
              fontSize: 12,
              padding: "12px 0",
            }}
          >
            No businesses yet
          </div>
        ) : (
          recentBiz.map((biz, i) => (
            <div
              key={`${biz.name}-${i}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 0",
                borderBottom:
                  i < recentBiz.length - 1
                    ? "1px solid var(--line-soft)"
                    : undefined,
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: "var(--bg-3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 9,
                  fontWeight: 600,
                  color: "var(--text-dim)",
                  flexShrink: 0,
                }}
              >
                {getInitials(biz.name)}
              </div>

              {/* Name + label */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <span
                  className="strata-mono"
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--text)",
                    marginRight: 4,
                    display: "inline",
                  }}
                >
                  {biz.name}
                </span>
                <span
                  style={{ fontSize: 11, color: "var(--text-mute)" }}
                >
                  registered
                </span>
              </div>

              {/* Time */}
              <div
                className="strata-mono"
                style={{ fontSize: 11, color: "var(--text-mute)", flexShrink: 0 }}
              >
                {timeAgo(biz.created_at)}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
