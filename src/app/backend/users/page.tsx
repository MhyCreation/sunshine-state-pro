import React from "react";
import { studioAuthUsers, AuthUser } from "@/lib/localbase/studio-fetch";

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

function parseMetadata(raw: string | Record<string, unknown>): Record<string, unknown> {
  if (typeof raw === "object" && raw !== null) return raw;
  try {
    return JSON.parse(raw as string) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function hasMfa(meta: Record<string, unknown>): boolean {
  return Boolean(meta?.mfa || meta?.totp);
}

function isToday(ts: string): boolean {
  const d = new Date(ts);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
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

function Pill({
  children,
  color,
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        border: `1px solid ${color ? "transparent" : "var(--line-soft)"}`,
        borderRadius: 3,
        fontSize: 9.5,
        fontFamily: "var(--strata-mono, ui-monospace)",
        color: color ?? "var(--text-dim)",
        background: color
          ? `color-mix(in oklab, ${color} 15%, var(--bg-2))`
          : "var(--bg-2)",
      }}
    >
      {children}
    </span>
  );
}

function UserRow({
  user,
  isLast,
}: {
  user: AuthUser;
  isLast: boolean;
}) {
  const meta = parseMetadata(user.metadata ?? {});
  const mfa = hasMfa(meta);
  const initials = (user.email?.[0] ?? "?").toUpperCase().repeat(2);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 0",
        borderBottom: isLast ? undefined : "1px solid var(--line-soft)",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: "var(--bg-3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 600,
          color: "var(--text-dim)",
          flexShrink: 0,
          textTransform: "uppercase",
        }}
      >
        {initials}
      </div>

      {/* Main info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          className="strata-mono"
          style={{
            fontSize: 13.5,
            fontWeight: 500,
            color: "var(--text)",
            marginBottom: 4,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {user.email}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Pill>{user.role || "user"}</Pill>
          <span
            className="strata-mono"
            style={{ fontSize: 10, color: "var(--text-mute)" }}
          >
            {timeAgo(user.created_at)}
          </span>
        </div>
      </div>

      {/* Right: time + 2FA */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 4,
          flexShrink: 0,
        }}
      >
        <span
          className="strata-mono"
          style={{ fontSize: 11, color: "var(--text-mute)" }}
        >
          {timeAgo(user.created_at)}
        </span>
        <span
          className="strata-mono"
          style={{
            fontSize: 10,
            color: mfa ? "oklch(0.78 0.12 235)" : "var(--text-mute)",
          }}
        >
          {mfa ? "2FA" : "—"}
        </span>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function UsersPage() {
  const users = await studioAuthUsers();
  const total = users.length;
  const todayCount = users.filter((u) => isToday(u.created_at)).length;

  return (
    <>
      <AppHeader
        title="Users"
        subtitle={`${total} total`}
        right={
          <Pill color="oklch(0.78 0.18 150)">
            +{todayCount} / today
          </Pill>
        }
      />

      <SectionTitle label="Auth users" />

      <div style={{ padding: "0 18px" }}>
        {users.length === 0 ? (
          <div
            className="strata-mono"
            style={{
              color: "var(--text-mute)",
              fontSize: 12,
              padding: "20px 0",
              textAlign: "center",
            }}
          >
            No users registered yet
          </div>
        ) : (
          users.map((user, i) => (
            <UserRow
              key={user.id}
              user={user}
              isLast={i === users.length - 1}
            />
          ))
        )}
      </div>
    </>
  );
}
