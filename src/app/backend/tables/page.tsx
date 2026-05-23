import React from "react";
import { studioTables, studioTable, TableDetail } from "@/lib/localbase/studio-fetch";

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

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        border: "1px solid var(--line-soft)",
        borderRadius: 3,
        fontSize: 9.5,
        fontFamily: "var(--strata-mono, ui-monospace)",
        color: "var(--text-dim)",
        background: "var(--bg-2)",
      }}
    >
      {children}
    </span>
  );
}

function TableRow({
  detail,
  maxRows,
}: {
  detail: TableDetail;
  maxRows: number;
}) {
  const rowCount = detail.count ?? 0;
  const fillPct = maxRows > 0 ? (rowCount / maxRows) * 100 : 0;
  // Approximate size: ~200 bytes per row
  const approxKb = ((rowCount * 200) / 1024).toFixed(1);
  const sizeLabel = rowCount > 0 ? `${approxKb} KB` : "— KB";

  return (
    <div
      style={{
        background: "var(--bg-1)",
        border: "1px solid var(--line-soft)",
        borderRadius: 6,
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {/* Row 1: name, schema pill, size */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          className="strata-mono"
          style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}
        >
          {detail.name}
        </span>
        <Pill>default</Pill>
        <span
          className="strata-mono"
          style={{
            fontSize: 11,
            color: "var(--text-mute)",
            marginLeft: "auto",
          }}
        >
          {sizeLabel}
        </span>
      </div>

      {/* Row 2: heatbar + row count */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Heatbar track */}
        <div
          style={{
            flex: 1,
            height: 3,
            background: "var(--bg-2)",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${fillPct}%`,
              height: "100%",
              background: "var(--accent)",
              borderRadius: 2,
            }}
          />
        </div>
        <span
          className="strata-mono"
          style={{ fontSize: 11, color: "var(--text-dim)", flexShrink: 0 }}
        >
          {rowCount.toLocaleString()} rows
        </span>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function TablesPage() {
  const tableNames = await studioTables();
  const details = await Promise.all(tableNames.map((n) => studioTable(n)));

  // Filter out nulls
  const validDetails: TableDetail[] = details.filter(
    (d): d is TableDetail => d !== null
  );

  const maxRows = Math.max(...validDetails.map((d) => d.count ?? 0), 1);
  const count = validDetails.length;

  return (
    <>
      <AppHeader
        title="Tables"
        subtitle={`${count} table${count !== 1 ? "s" : ""} · default db`}
      />

      {/* Search bar (visual only) */}
      <div style={{ padding: "14px 18px 0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "var(--bg-1)",
            border: "1px solid var(--line-soft)",
            borderRadius: 8,
            padding: "10px 12px",
          }}
        >
          {/* Search icon */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-mute)"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <span
            style={{
              flex: 1,
              fontSize: 13,
              color: "var(--text-mute)",
              fontFamily: "var(--strata-sans, system-ui)",
            }}
          >
            Search tables…
          </span>
          {/* ⌘K pill */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "2px 6px",
              border: "1px solid var(--line-soft)",
              borderRadius: 4,
              fontSize: 10,
              fontFamily: "var(--strata-mono, ui-monospace)",
              color: "var(--text-mute)",
              background: "var(--bg-2)",
            }}
          >
            ⌘K
          </span>
        </div>
      </div>

      <SectionTitle label="Storage by table" />

      {/* Table list */}
      <div
        style={{
          padding: "0 18px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {validDetails.length === 0 ? (
          <div
            className="strata-mono"
            style={{
              color: "var(--text-mute)",
              fontSize: 12,
              padding: "12px 0",
            }}
          >
            No tables found
          </div>
        ) : (
          validDetails.map((detail) => (
            <TableRow key={detail.name} detail={detail} maxRows={maxRows} />
          ))
        )}
      </div>
    </>
  );
}
