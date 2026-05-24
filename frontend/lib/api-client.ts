import 'server-only'
import { getSession } from './session'

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:4000'

export async function apiClient<T>(path: string, init?: RequestInit): Promise<T> {
  const session = await getSession()
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(init?.headers as Record<string, string> ?? {}) }
  if (session?.token) headers['Authorization'] = `Bearer ${session.token}`
  const res = await fetch(`${BACKEND_URL}${path}`, { ...init, headers, cache: 'no-store' })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `API error ${res.status}`)
  }
  return res.json()
}
