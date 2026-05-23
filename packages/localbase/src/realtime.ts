import type { ServerWebSocket } from 'bun'
import type { RealtimeEvent } from './types.ts'

interface Subscription {
  id: string
  table: string
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  filter?: Record<string, unknown>
}

interface WsData {
  id: string
  subscriptions: Map<string, Subscription>
}

const clients = new Map<string, ServerWebSocket<WsData>>()

export type { WsData }

export function handleWsOpen(ws: ServerWebSocket<WsData>): void {
  clients.set(ws.data.id, ws)
}

export function handleWsClose(ws: ServerWebSocket<WsData>): void {
  clients.delete(ws.data.id)
}

export function handleWsMessage(ws: ServerWebSocket<WsData>, raw: string | Buffer): void {
  let msg: Record<string, unknown>
  try {
    msg = JSON.parse(raw.toString())
  } catch {
    ws.send(JSON.stringify({ type: 'error', message: 'invalid JSON' }))
    return
  }

  if (msg['type'] === 'subscribe') {
    const id = crypto.randomUUID()
    ws.data.subscriptions.set(id, {
      id,
      table: String(msg['table'] ?? '*'),
      event: (msg['event'] as Subscription['event']) ?? '*',
      filter: msg['filter'] as Record<string, unknown> | undefined,
    })
    ws.send(JSON.stringify({ type: 'subscribed', id, table: msg['table'] }))
    return
  }

  if (msg['type'] === 'unsubscribe') {
    ws.data.subscriptions.delete(String(msg['id']))
    ws.send(JSON.stringify({ type: 'unsubscribed', id: msg['id'] }))
    return
  }

  ws.send(JSON.stringify({ type: 'error', message: `unknown message type: ${msg['type']}` }))
}

export function emit(
  table: string,
  event: 'INSERT' | 'UPDATE' | 'DELETE',
  record: Record<string, unknown>,
  oldRecord?: Record<string, unknown>
): void {
  const payload: RealtimeEvent = { event, table, record, old_record: oldRecord }
  const json = JSON.stringify({ type: 'event', ...payload })

  for (const [, ws] of clients) {
    for (const [, sub] of ws.data.subscriptions) {
      if (sub.table !== '*' && sub.table !== table) continue
      if (sub.event !== '*' && sub.event !== event) continue

      if (sub.filter) {
        const matches = Object.entries(sub.filter).every(([k, v]) => record[k] === v)
        if (!matches) continue
      }

      try {
        ws.send(json)
      } catch {
        // Dead socket; will be cleaned up on close
      }
    }
  }
}
