'use client'
import { useActionState } from 'react'
import Link from 'next/link'
import { register, AuthState } from '@/actions/auth.actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function RegisterPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(register, undefined)
  if (state?.message) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-xl border border-green-200 bg-green-50 p-8 text-center">
        <p className="text-green-700 font-medium">{state.message}</p>
        <Link href="/login" className="mt-4 inline-block text-sm text-blue-600 hover:underline">Back to login</Link>
      </div>
    </div>
  )
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-blue-600">DeliveryAgg</h1>
          <p className="mt-1 text-sm text-gray-500">Register your business</p>
        </div>
        <form action={action} className="flex flex-col gap-4">
          {state?.error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{state.error}</div>}
          <Input label="Business name" id="businessName" name="businessName" required />
          <Input label="Your name" id="contactName" name="contactName" required />
          <Input label="Phone" id="phone" name="phone" type="tel" required />
          <Input label="Email" id="email" name="email" type="email" required />
          <Input label="Password" id="password" name="password" type="password" minLength={8} required />
          <Button type="submit" loading={pending} className="w-full">Request access</Button>
          <p className="text-center text-sm text-gray-500">Already have an account? <Link href="/login" className="font-medium text-blue-600 hover:underline">Sign in</Link></p>
        </form>
      </div>
    </div>
  )
}
