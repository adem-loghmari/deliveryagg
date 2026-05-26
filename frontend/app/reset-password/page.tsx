'use client'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function ResetPasswordPage() {
  const token = useSearchParams().get('token') ?? ''
  const [password, setPassword] = useState(''), [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState(''), [error, setError] = useState(''), [loading, setLoading] = useState(false)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true); setError('')
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000'}/api/auth/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, newPassword: password }) })
    const data = await res.json()
    if (!res.ok) setError(data.error ?? 'Reset failed'); else setMsg(data.message)
    setLoading(false)
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center"><h1 className="text-2xl font-bold text-blue-600">DeliveryAgg</h1><p className="mt-1 text-sm text-gray-500">Set a new password</p></div>
        {!token ? <p className="text-sm text-red-600 text-center">Invalid link. <Link href="/forgot-password" className="underline">Request a new one</Link>.</p>
        : msg ? <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700 text-center">{msg}<div className="mt-3"><Link href="/login" className="font-medium text-blue-600 hover:underline">Sign in</Link></div></div>
        : <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
            <Input label="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
            <Input label="Confirm password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            <Button type="submit" loading={loading} className="w-full">Reset password</Button>
          </form>}
      </div>
    </div>
  )
}
