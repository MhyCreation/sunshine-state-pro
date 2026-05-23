import type { TableSchema, RLSRules, AuthUser } from './types.ts'

// Central registry of user-defined table metadata (RLS rules, etc.)
const registry = new Map<string, TableSchema>()

export function defineTable(schema: TableSchema): void {
  registry.set(schema.name, schema)
}

export function setRLS(tableName: string, rules: RLSRules): void {
  const existing = registry.get(tableName) ?? { name: tableName }
  registry.set(tableName, { ...existing, rls: rules })
}

export function applyRLSFilter(tableName: string, user: AuthUser | null): Record<string, unknown> {
  return registry.get(tableName)?.rls?.select?.(user) ?? {}
}

export function checkRLSInsert(
  tableName: string,
  user: AuthUser | null,
  row: Record<string, unknown>
): boolean {
  const rls = registry.get(tableName)?.rls
  return rls?.insert ? rls.insert(user, row) : true
}

export function checkRLSUpdate(
  tableName: string,
  user: AuthUser | null,
  row: Record<string, unknown>
): boolean {
  const rls = registry.get(tableName)?.rls
  return rls?.update ? rls.update(user, row) : true
}

export function checkRLSDelete(
  tableName: string,
  user: AuthUser | null,
  row: Record<string, unknown>
): boolean {
  const rls = registry.get(tableName)?.rls
  return rls?.delete ? rls.delete(user, row) : true
}
