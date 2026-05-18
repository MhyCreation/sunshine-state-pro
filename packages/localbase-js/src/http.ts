import type { LBClientConfig, LBError } from './types.ts'

export class HttpClient {
  readonly baseUrl: string
  #apiKey: string | undefined
  #accessToken: string | null = null

  constructor(config: LBClientConfig) {
    this.baseUrl = config.url.replace(/\/$/, '')
    this.#apiKey = config.apiKey
  }

  setAccessToken(token: string | null): void {
    this.#accessToken = token
  }

  getAccessToken(): string | null {
    return this.#accessToken
  }

  async request<T>(
    method: string,
    path: string,
    options: {
      body?: unknown
      query?: Record<string, string | number | boolean | undefined>
    } = {}
  ): Promise<{ data: T | null; error: LBError | null }> {
    const url = new URL(this.baseUrl + path)

    if (options.query) {
      for (const [k, v] of Object.entries(options.query)) {
        if (v !== undefined) url.searchParams.set(k, String(v))
      }
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (this.#accessToken) headers['Authorization'] = `Bearer ${this.#accessToken}`
    if (this.#apiKey) headers['X-API-Key'] = this.#apiKey

    try {
      const res = await fetch(url.toString(), {
        method,
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      })

      const json = (await res.json()) as { data?: T; error?: LBError }

      if (!res.ok) {
        return {
          data: null,
          error: json.error ?? { code: 'HTTP_ERROR', message: `HTTP ${res.status}` },
        }
      }

      return { data: (json.data ?? null) as T | null, error: null }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'network error'
      return { data: null, error: { code: 'NETWORK_ERROR', message: msg } }
    }
  }
}
