'use client'
import { useState, useTransition } from 'react'
import toast from 'react-hot-toast'
import { changePassword } from '@/actions/auth.actions'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function SettingsPage() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (next !== confirm) { toast.error('Passwords do not match'); return }
    startTransition(async () => {
      const result = await changePassword(current, next)
      if (result?.error) toast.error(result.error)
      else { toast.success('Password changed'); setCurrent(''); setNext(''); setConfirm('') }
    })
  }

  return (
    <div className="max-w-sm">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Settings</h1>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Change password</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Current password" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
          <Input label="New password" type="password" value={next} onChange={(e) => setNext(e.target.value)} minLength={8} required />
          <Input label="Confirm new password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          <Button type="submit" loading={pending}>Change password</Button>
        </form>
      </div>
    </div>
  )
}
