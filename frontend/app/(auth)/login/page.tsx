'use client'
import { useActionState } from 'react'
import Link from 'next/link'
import { login, AuthState } from '@/actions/auth.actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function LoginPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(login, undefined)
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-blue-600">DeliveryAgg</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
        </div>
        <form action={action} className="flex flex-col gap-4">
          {state?.error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{state.error}</div>}
          <Input label="Email" id="email" name="email" type="email" autoComplete="email" required />
          <Input label="Password" id="password" name="password" type="password" autoComplete="current-password" required />
          <Button type="submit" loading={pending} className="w-full">Sign in</Button>
          <p className="text-center text-sm text-gray-500">
            <Link href="/forgot-password" className="text-gray-400 hover:text-blue-600">Forgot password?</Link>
            {' · '}
            New business? <Link href="/register" className="font-medium text-blue-600 hover:underline">Request access</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
