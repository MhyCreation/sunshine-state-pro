// Server-only utility — plain async functions for use in server components.
// Do NOT import this in client components.

const BASE_URL =
  process.env.LOCALBASE_URL ??
  process.env.NEXT_PUBLIC_LOCALBASE_URL ??
  "http://localhost:7700";

const API_KEY = process.env.LOCALBASE_API_KEY ?? "";

function studioHeaders(): HeadersInit {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (API_KEY) h["X-API-Key"] = API_KEY;
  return h;
}

// ── Types ───────────────────────────────────────────────────────────────────

export interface HealthResult {
  status: string;
  timestamp: string;
}

export interface ColumnInfo {
  name: string;
  type: string;
  nullable?: boolean;
}

export interface TableDetail {
  name: string;
  columns: ColumnInfo[];
  indexes: string[];
  count: number;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  metadata: string | Record<string, unknown>;
  created_at: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

async function safeFetch<T>(
  url: string,
  init?: RequestInit,
): Promise<T | null> {
  try {
    const res = await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(3000),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// ── Exports ──────────────────────────────────────────────────────────────────

export async function serverHealth(): Promise<HealthResult | null> {
  return safeFetch<HealthResult>(`${BASE_URL}/health`, {
    headers: studioHeaders(),
  });
}

export async function studioTables(): Promise<string[]> {
  const res = await safeFetch<{ data: string[] }>(
    `${BASE_URL}/studio/api/tables`,
    { headers: studioHeaders() },
  );
  return res?.data ?? [];
}

export async function studioTable(name: string): Promise<TableDetail | null> {
  const res = await safeFetch<{ data: TableDetail }>(
    `${BASE_URL}/studio/api/tables/${encodeURIComponent(name)}`,
    { headers: studioHeaders() },
  );
  return res?.data ?? null;
}

export async function studioAuthUsers(): Promise<AuthUser[]> {
  const res = await safeFetch<{ data: AuthUser[] }>(
    `${BASE_URL}/studio/api/auth/users`,
    { headers: studioHeaders() },
  );
  return res?.data ?? [];
}

export interface SqlSelectResult<T = Record<string, unknown>> {
  type: "select";
  rows: T[];
  count: number;
}

export async function studioSql<T = Record<string, unknown>>(
  sql: string,
): Promise<SqlSelectResult<T> | null> {
  const res = await safeFetch<{ data: SqlSelectResult<T> }>(
    `${BASE_URL}/studio/api/sql`,
    {
      method: "POST",
      headers: studioHeaders(),
      body: JSON.stringify({ sql }),
    },
  );
  return res?.data ?? null;
}
