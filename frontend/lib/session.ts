import 'server-only'
import { cookies } from 'next/headers'
import { encrypt, decrypt } from './session-crypto'

export type { SessionPayload } from './session-crypto'
export { encrypt, decrypt }

export async function createSession(payload: import('./session-crypto').SessionPayload) {
  const encrypted = await encrypt(payload)
  const jar = await cookies()
  jar.set('session', encrypted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function deleteSession() {
  const jar = await cookies()
  jar.delete('session')
}

export async function getSession(): Promise<import('./session-crypto').SessionPayload | null> {
  const jar = await cookies()
  const c = jar.get('session')
  if (!c) return null
  return decrypt(c.value)
}
