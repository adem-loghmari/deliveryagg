'use server'
import { redirect } from 'next/navigation'
import { createSession, deleteSession } from '@/lib/session'
import { loginSchema, registerSchema } from '@/lib/schemas/auth.schema'

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:4000'

export type AuthState = { error?: string; message?: string } | undefined

export async function login(_state: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({ email: formData.get('email'), password: formData.get('password') })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  const res = await fetch(`${BACKEND}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parsed.data) })
  const data = await res.json()
  if (!res.ok) return { error: data.error ?? 'Login failed' }
  await createSession({ userId: '', role: data.role, businessId: data.businessId ?? undefined, token: data.token })
  redirect(data.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard')
}

export async function register(_state: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  const res = await fetch(`${BACKEND}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parsed.data) })
  const data = await res.json()
  if (!res.ok) return { error: data.error ?? 'Registration failed' }
  return { message: data.message }
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}
