import type { HttpClient } from './http.ts'
import type { AuthUser, AuthSession, LBResult } from './types.ts'

export class AuthModule {
  #http: HttpClient
  #session: AuthSession | null = null

  constructor(http: HttpClient) {
    this.#http = http
  }

  async signUp(opts: {
    email: string
    password: string
    data?: Record<string, unknown>
    role?: string
  }): Promise<LBResult<AuthSession>> {
    const result = await this.#http.request<AuthSession>('POST', '/auth/signup', { body: opts })
    if (result.data) this.#applySession(result.data)
    return result
  }

  async signIn(opts: { email: string; password: string }): Promise<LBResult<AuthSession>> {
    const result = await this.#http.request<AuthSession>('POST', '/auth/login', { body: opts })
    if (result.data) this.#applySession(result.data)
    return result
  }

  async signOut(): Promise<LBResult<{ success: boolean }>> {
    const result = await this.#http.request<{ success: boolean }>('POST', '/auth/logout', {
      body: { refresh_token: this.#session?.refresh_token },
    })
    this.#clearSession()
    return result
  }

  async getUser(): Promise<LBResult<AuthUser>> {
    const result = await this.#http.request<{ user: AuthUser }>('GET', '/auth/me')
    return { data: result.data?.user ?? null, error: result.error }
  }

  async refreshSession(): Promise<LBResult<AuthSession>> {
    if (!this.#session?.refresh_token) {
      return { data: null, error: { code: 'NO_SESSION', message: 'no active session' } }
    }
    const result = await this.#http.request<AuthSession>('POST', '/auth/refresh', {
      body: { refresh_token: this.#session.refresh_token },
    })
    if (result.data) this.#applySession(result.data)
    return result
  }

  getSession(): AuthSession | null {
    return this.#session
  }

  // Set just the access token without a full session (used by server-side adapters)
  setToken(token: string): void {
    this.#http.setAccessToken(token)
  }

  // Restore a previously persisted session (e.g. from localStorage)
  restoreSession(session: AuthSession): void {
    this.#applySession(session)
  }

  #applySession(session: AuthSession): void {
    this.#session = session
    this.#http.setAccessToken(session.access_token)
  }

  #clearSession(): void {
    this.#session = null
    this.#http.setAccessToken(null)
  }
}
