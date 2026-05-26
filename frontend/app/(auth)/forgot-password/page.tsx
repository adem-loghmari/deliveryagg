'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000'}/api/auth/forgot-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
    setMsg('If that email is registered, a reset link has been sent.'); setLoading(false)
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center"><h1 className="text-2xl font-bold text-blue-600">DeliveryAgg</h1><p className="mt-1 text-sm text-gray-500">Reset your password</p></div>
        {msg ? <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700 text-center">{msg}<div className="mt-3"><Link href="/login" className="font-medium text-blue-600 hover:underline">Back to login</Link></div></div>
        : <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Button type="submit" loading={loading} className="w-full">Send reset link</Button>
            <Link href="/login" className="text-center text-sm text-gray-500 hover:text-blue-600">Back to login</Link>
          </form>}
      </div>
    </div>
  )
}
