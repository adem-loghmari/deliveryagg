import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const key = new TextEncoder().encode(process.env.SESSION_SECRET ?? 'dev-session-secret-change-in-prod')

export interface SessionPayload {
  userId: string
  role: string
  businessId?: string
  token: string
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key)
}

export async function decrypt(session: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(session, key, { algorithms: ['HS256'] })
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export async function createSession(payload: SessionPayload) {
  const encrypted = await encrypt(payload)
  const jar = await cookies()
  jar.set('session', encrypted, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 })
}

export async function deleteSession() {
  const jar = await cookies()
  jar.delete('session')
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies()
  const c = jar.get('session')
  if (!c) return null
  return decrypt(c.value)
}
