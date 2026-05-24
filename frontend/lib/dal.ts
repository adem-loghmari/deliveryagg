import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { getSession, SessionPayload } from './session'

export const verifySession = cache(async (): Promise<SessionPayload> => {
  const session = await getSession()
  if (!session) redirect('/login')
  return session
})

export const verifyAdminSession = cache(async (): Promise<SessionPayload> => {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'ADMIN') redirect('/dashboard')
  return session
})

export const verifyBusinessSession = cache(async (): Promise<SessionPayload> => {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'BUSINESS') redirect('/admin/dashboard')
  return session
})
