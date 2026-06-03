import { SignJWT, jwtVerify } from 'jose'

const key = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? 'dev-session-secret-change-in-prod-min-32-chars'
)

export interface SessionPayload {
  userId: string
  role: string
  businessId?: string
  token: string
}

export async function encrypt(payload: SessionPayload): Promise<string> {
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
