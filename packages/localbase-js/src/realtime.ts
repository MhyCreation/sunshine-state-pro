import type { RealtimeEvent } from './types.ts'

type Handler<T> = (event: RealtimeEvent<T>) => void

interface PendingSub {
  localId: string
  table: string
  event?: string
  filter?: Record<string, unknown>
}

export class RealtimeClient {
  #wsUrl: string
  #ws: WebSocket | null = null
  #handlers = new Map<string, Handler<any>>()
  #pending: PendingSub[] = []
  #retryMs = 1000
  #retryTimer: ReturnType<typeof setTimeout> | null = null

  constructor(wsUrl: string) {
    this.#wsUrl = wsUrl
  }

  on<T = Record<string, unknown>>(
    table: string,
    handler: Handler<T>,
    opts?: { event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'; filter?: Record<string, unknown> }
  ): { off: () => void } {
    const localId = crypto.randomUUID()
    this.#handlers.set(localId, handler)

    const pending: PendingSub = { localId, table, event: opts?.event, filter: opts?.filter }
    this.#pending.push(pending)

    if (!this.#ws) this.#connect()
    else if (this.#ws.readyState === WebSocket.OPEN) this.#send(pending)

    return {
      off: () => {
        this.#handlers.delete(localId)
        this.#pending = this.#pending.filter((p) => p.localId !== localId)
      },
    }
  }

  disconnect(): void {
    if (this.#retryTimer) clearTimeout(this.#retryTimer)
    this.#ws?.close()
    this.#ws = null
  }

  #connect(): void {
    this.#ws = new WebSocket(this.#wsUrl)

    this.#ws.onopen = () => {
      this.#retryMs = 1000
      for (const sub of this.#pending) this.#send(sub)
    }

    this.#ws.onmessage = ({ data }) => {
      let msg: Record<string, unknown>
      try {
        msg = JSON.parse(data)
      } catch {
        return
      }

      if (msg['type'] !== 'event') return

      const event = msg as unknown as RealtimeEvent
      for (const [localId, handler] of this.#handlers) {
        const sub = this.#pending.find((p) => p.localId === localId)
        if (!sub) continue
        if (sub.table !== '*' && sub.table !== event.table) continue
        handler(event)
      }
    }

    this.#ws.onclose = () => {
      this.#retryTimer = setTimeout(() => {
        this.#retryMs = Math.min(this.#retryMs * 2, 30_000)
        this.#connect()
      }, this.#retryMs)
    }
  }

  #send(sub: PendingSub): void {
    this.#ws?.send(
      JSON.stringify({ type: 'subscribe', table: sub.table, event: sub.event, filter: sub.filter })
    )
  }
}
